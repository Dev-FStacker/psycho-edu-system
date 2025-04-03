using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Globalization;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using BLL.Interface;
using Common.DTO;
using Common.Enum;
using DAL.Entities;
using DAL.UnitOfWork;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace BLL.Service
{
    public class TargetProgramService : ITargetProgramService
    {
        private readonly IUnitOfWork _unitOfWork;

        public TargetProgramService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<List<object>> GetAllProgramsAsync(string? day = null, int? capacity = null, string? time = null, int? minPoint = null, string? dimensionName = null)
        {
            var query = _unitOfWork.TargetProgram.GetAll()
                            .Include(p => p.Dimension)
                            .Include(p => p.Counselor)
                            .OrderByDescending(p => p.CreateAt)
                            .AsQueryable();

            if (!string.IsNullOrEmpty(day))
            {
                if (DateTime.TryParseExact(day, "yyyy-MM-dd",
                    CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedDay))
                {
                    query = query.Where(p => p.StartDate.Date == parsedDay.Date);
                }
                else
                {
                    throw new FormatException("Invalid date format. Expected format: yyyy-MM-dd.");
                }
            }

            if (capacity.HasValue)
            {
                query = query.Where(p => p.Capacity >= capacity.Value);
            }

            if (!string.IsNullOrEmpty(time))
            {
                TimeSpan filterTime = TimeSpan.Parse(time);
                query = query.Where(t => t.StartDate.TimeOfDay == filterTime);
            }

            if (minPoint.HasValue)
            {
                query = query.Where(p => p.MinPoint >= minPoint.Value);
            }

            if (!string.IsNullOrEmpty(dimensionName))
            {
                query = query.Where(p => p.Dimension != null && p.Dimension.DimensionName == dimensionName);
            }

            var programs = await query.ToListAsync();

            return programs.Select(p => new
            {
                p.ProgramId,
                p.Name,
                p.Description,
                Day = p.StartDate.ToString("dd/MM/yyyy"),
                Time = p.StartDate.ToString("HH:mm"),
                p.StartDate,
                p.MinPoint,
                p.Capacity,
                p.CurrentCapacity,
                Counselor = p.Counselor != null ? new
                {
                    p.Counselor.FullName,
                    p.Counselor.UserId,
                    p.Counselor.Phone,
                    p.Counselor.Email,
                    Birthday = p.Counselor.BirthDay.ToString("dd/MM/yyyy"),
                    p.Counselor.GoogleMeetURL,
                    p.Counselor.Gender,
                    p.Counselor.Address
                } : null,
                DimensionName = p.Dimension?.DimensionName
            }).ToList<object>();
        }
        public async Task<TargetProgramDTO?> GetProgramByIdAsync(Guid programId)
        {
            var program = await _unitOfWork.TargetProgram.GetByIdAsync(programId);
            if (program == null) return null;

            return new TargetProgramDTO
            {
                ProgramId = program.ProgramId,
                Name = program.Name,
                Description = program.Description,
                StartDate = program.StartDate,
                MinPoint = program.MinPoint,
                Capacity = program.Capacity,
                DimensionId = program.DimensionId
            };
        }
        public async Task<TargetProgramDTO> AddProgramAsync(TargetProgramDTO dto)
        {
            try
            {
                var counselor = await _unitOfWork.User.GetByIdAsync(dto.CounselorId);
                if (counselor == null)
                {
                    throw new InvalidOperationException("Counselor not found.");
                }

                if (counselor.RoleId != 2)
                {
                    throw new UnauthorizedAccessException("Invalid role.");
                }
                TimeSpan startTime = dto.StartDate.TimeOfDay;
                int slotNumber = GetSlotNumber(startTime);
                var availableSlot = await _unitOfWork.Schedule.GetByConditionAsync(s => s.SlotId == slotNumber && DateOnly.FromDateTime(s.Date) == DateOnly.FromDateTime(dto.StartDate) && s.UserId == counselor.UserId);
                if (availableSlot == null)
                {
                    throw new InvalidOperationException("Counselor has no available slots at this time.");
                }
                var appointment = await _unitOfWork.Appointment.GetByConditionAsync(a => a.SlotId == slotNumber && a.Date == DateOnly.FromDateTime(dto.StartDate) && counselor.UserId == a.MeetingWith);
                if (appointment != null)
                {
                    throw new InvalidOperationException("Counselor already has an appointment at this time.");
                }
                var existingPrograms = await _unitOfWork.TargetProgram.GetAllByListAsync(p => p.CounselorId == dto.CounselorId && p.StartDate == dto.StartDate);
                if (existingPrograms.Count() >= 1)
                {
                    throw new InvalidOperationException("This counselor already has a program at this time.");
                }

                var newProgram = new TargetProgram
                {
                    ProgramId = Guid.NewGuid(),
                    Name = dto.Name,
                    Description = dto.Description,
                    CounselorId = counselor.UserId,
                    CurrentCapacity = 0,
                    StartDate = dto.StartDate,
                    MinPoint = dto.MinPoint,
                    Capacity = dto.Capacity,
                    CreateAt = DateTime.UtcNow,
                    DimensionId = dto.DimensionId
                };

                var addedProgram = await _unitOfWork.TargetProgram.AddAsync(newProgram);
                await _unitOfWork.SaveChangeAsync();

                return new TargetProgramDTO
                {
                    Name = addedProgram.Name,
                    Description = addedProgram.Description,
                    StartDate = addedProgram.StartDate,
                    MinPoint = addedProgram.MinPoint,
                    Capacity = addedProgram.Capacity,
                    DimensionId = addedProgram.DimensionId
                };
            }
            catch (Exception ex)
            {
                var errorMessage = $"Error while saving data: {ex.InnerException?.Message ?? ex.Message}";
                Console.WriteLine(errorMessage);
                throw new Exception(errorMessage);
            }
        }
        public int GetSlotNumber(TimeSpan inputTime)
        {
            Dictionary<int, int> timeSlots = new Dictionary<int, int>
            {
                    { 8, 1 }, { 9, 2 }, { 10, 3 }, { 11, 4 },
                    { 13, 5 }, { 14, 6 }, { 15, 7 }, { 16, 8 }
            };
            int hour = inputTime.Hours;
            return timeSlots.TryGetValue(hour, out int slot) ? slot : -1;
        }
        public async Task UpdateProgramAsync(TargetProgramDTO dto)
        {
            if (dto.ProgramId == null)
                throw new Exception("ProgramId is required");

            var existingProgram = await _unitOfWork.TargetProgram.GetByConditionAsync(p => p.ProgramId == dto.ProgramId);

            if (existingProgram == null) throw new Exception("Program not found");

            existingProgram.Name = dto.Name;
            existingProgram.Description = dto.Description;
            existingProgram.MinPoint = dto.MinPoint;
            existingProgram.Capacity = dto.Capacity;
            existingProgram.DimensionId = dto.DimensionId;
            if (dto.CounselorId != Guid.Empty)
                existingProgram.CounselorId = dto.CounselorId;

            await _unitOfWork.SaveChangeAsync();
        }
        public async Task DeleteProgramAsync(Guid? programId)
        {
            if (programId == null) throw new Exception("ProgramId is required");

            var program = await _unitOfWork.TargetProgram.GetByIdAsync(programId.Value);
            if (program != null)
            {
                _unitOfWork.TargetProgram.Delete(program);
                await _unitOfWork.SaveChangeAsync();
            }
        }
        public async Task<ResponseDTO> AssignStudentToTargetProgramAsync(StudentDimensionDTO request)
        {
            try
            {
                var user = await _unitOfWork.User.GetByIdAsync(request.StudentId);

                if (user == null) return new ResponseDTO("User not found", 400, false, string.Empty);

                if (string.IsNullOrEmpty(request.Stress.ToString()) || string.IsNullOrEmpty(request.Anxiety.ToString()) || string.IsNullOrEmpty(request.Depression.ToString()))
                {
                    return new ResponseDTO("All fields are required", 400, false, string.Empty);
                }
                var targetPrograms = await _unitOfWork.TargetProgram.GetAllByListAsync(p =>
                                    ((p.DimensionId == 1 && request.Anxiety >= p.MinPoint) ||
                                    (p.DimensionId == 2 && request.Depression >= p.MinPoint) ||
                                    (p.DimensionId == 3 && request.Stress >= p.MinPoint)) &&
                                    p.CurrentCapacity < p.Capacity);
                if (!targetPrograms.Any())
                    return new ResponseDTO("No matching programs found", 404, false, string.Empty);

                var assignedPrograms = new List<string>();

                foreach (var program in targetPrograms)
                {
                    var existingEnrollment = await _unitOfWork.ProgramEnrollment.GetAllByListAsync(e =>
                        e.StudentId == request.StudentId && e.ProgramId == program.ProgramId);

                    if (!existingEnrollment.Any())
                    {
                        var enrollment = new ProgramEnrollment
                        {
                            StudentId = request.StudentId,
                            ProgramId = program.ProgramId,
                            Status = "Not Yet",
                            EnrolledAt = DateTime.UtcNow,
                            CreateAt = DateTime.UtcNow
                        };

                        await _unitOfWork.ProgramEnrollment.AddAsync(enrollment);
                        assignedPrograms.Add(program.Name);

                        program.CurrentCapacity += 1;
                        await _unitOfWork.TargetProgram.UpdateAsync(program);
                    }
                }

                await _unitOfWork.SaveChangeAsync();

                if (!assignedPrograms.Any())
                    return new ResponseDTO("Student is already enrolled in all matching programs", 200, true, string.Empty);

                return new ResponseDTO($"Student assigned to: {string.Join(", ", assignedPrograms)}", 200, true, string.Empty);

            }
            catch (Exception ex)
            {
                return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }
        public async Task<List<object>> GetAllProgramsByUserIdAsync(Guid userId, string? day = null, int? capacity = null, string? time = null, int? minPoint = null, string? dimensionName = null)
        {
            var user = await _unitOfWork.User.GetByIdAsync(userId);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            var query = _unitOfWork.TargetProgram.GetAll()
                            .Include(p => p.Dimension)
                            .Include(p => p.Counselor)
                            .OrderByDescending(p => p.CreateAt)
                            .AsQueryable();
            if (user.RoleId == 3)
            {
                var enrolledProgram = await _unitOfWork.ProgramEnrollment.GetAll().Where(p => p.StudentId == userId).Select(p => p.ProgramId).ToListAsync();

                query = query.Where(p =>  enrolledProgram.Contains(p.ProgramId));
            }

            else if (user.RoleId == 2)
            {
                query = query.Where(p => p.Counselor != null && p.Counselor.UserId == userId);
            }

            if (!string.IsNullOrEmpty(day))
            {
                if (DateTime.TryParseExact(day, "yyyy-MM-dd",
                    CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedDay))
                {
                    query = query.Where(p => p.StartDate.Date == parsedDay.Date);
                }
                else
                {
                    throw new FormatException("Invalid date format. Expected format: yyyy-MM-dd.");
                }
            }

            if (capacity.HasValue)
            {
                query = query.Where(p => p.Capacity >= capacity.Value);
            }

            if (!string.IsNullOrEmpty(time))
            {
                TimeSpan filterTime = TimeSpan.Parse(time);
                query = query.Where(t => t.StartDate.TimeOfDay == filterTime);
            }

            if (minPoint.HasValue)
            {
                query = query.Where(p => p.MinPoint >= minPoint.Value);
            }

            if (!string.IsNullOrEmpty(dimensionName))
            {
                query = query.Where(p => p.Dimension != null && p.Dimension.DimensionName == dimensionName);
            }

            var programs = await query.ToListAsync();

            return programs.Select(p => new
            {
                p.ProgramId,
                p.Name,
                p.Description,
                Day = p.StartDate.ToString("dd/MM/yyyy"),
                Time = p.StartDate.ToString("HH:mm"),
                p.StartDate,
                p.MinPoint,
                p.Capacity,
                p.CurrentCapacity,
                Counselor = p.Counselor != null ? new
                {
                    p.Counselor.FullName,
                    p.Counselor.UserId,
                    p.Counselor.Phone,
                    p.Counselor.Email,
                    Birthday = p.Counselor.BirthDay.ToString("dd/MM/yyyy"),
                    p.Counselor.GoogleMeetURL,
                    p.Counselor.Gender,
                    p.Counselor.Address
                } : null,
                DimensionName = p.Dimension?.DimensionName
            }).ToList<object>();
        }
        public async Task<ResponseDTO> GetAvailableCounselorsAsync(DateTime selectedDateTime)
        {
            try
            {
                TimeSpan startTime = selectedDateTime.TimeOfDay;
                int slotNumber = GetSlotNumber(startTime);

                // Get all counselors (RoleId = 2)
                var counselors = await _unitOfWork.User.GetAllByListAsync(u => u.RoleId == 2);

                List<CounselorsDTO> availableCounselors = new List<CounselorsDTO>();

                foreach (var counselor in counselors)
                {
                    // Check if counselor has available slots in schedule
                    var availableSlot = await _unitOfWork.Schedule.GetByConditionAsync(s =>
                        s.SlotId == slotNumber &&
                        DateOnly.FromDateTime(s.Date) == DateOnly.FromDateTime(selectedDateTime) &&
                        s.UserId == counselor.UserId);

                    if (availableSlot == null)
                    {
                        continue; // Skip if no available slot
                    }

                    // Check if counselor has an appointment at this time
                    var appointment = await _unitOfWork.Appointment.GetByConditionAsync(a =>
                        a.SlotId == slotNumber &&
                        a.Date == DateOnly.FromDateTime(selectedDateTime) &&
                        counselor.UserId == a.MeetingWith);

                    if (appointment != null)
                    {
                        continue; // Skip if counselor has an appointment
                    }

                    // Check if counselor already has a program at this time
                    var existingPrograms = await _unitOfWork.TargetProgram.GetAllByListAsync(p =>
                        p.CounselorId == counselor.UserId &&
                        p.StartDate == selectedDateTime);

                    if (existingPrograms.Count() >= 1)
                    {
                        continue; // Skip if counselor is assigned to another program
                    }
                    var availableCounselor = new CounselorsDTO
                    {
                        UserId = counselor.UserId,
                        FullName = counselor.FullName,
                        Email = counselor.Email,
                        Address = counselor.Address,
                        BirthDay = counselor.BirthDay,
                        Gender = counselor.Gender,
                        GoogleMeetURL = counselor.GoogleMeetURL,
                        Phone = counselor.Phone,
                    };
                    // If the counselor meets all conditions, add to the list
                    availableCounselors.Add(availableCounselor);
                }
                return new ResponseDTO ("Available counselors retrieved successfully.", 200, true, availableCounselors);
            }
            catch (Exception ex)
            {
               return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }
        public async Task<ResponseDTO> RegisterTargetProgramAsync(Guid programId, Guid userId)
        {
            try
            {
                var user = await _unitOfWork.User.GetByIdAsync(userId);
                if (user == null)
                {
                    return new ResponseDTO("User not found.", 400, false, string.Empty);
                }
                if (user.RoleId != 3)
                {
                    return new ResponseDTO("Invalid role.", 400, false, string.Empty);
                }
                var program = await _unitOfWork.TargetProgram.GetByIdAsync(programId);
                if (program == null)
                {
                    return new ResponseDTO("Target program not found.", 400, false, string.Empty);
                }

                TimeZoneInfo vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
                DateTime vietnamNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamTimeZone);

                if (program.StartDate < vietnamNow)
                {
                    return new ResponseDTO("Target program has been happened", 200, false, string.Empty);
                }

                if (program.CurrentCapacity == program.Capacity)
                {
                    return new ResponseDTO("Target program is full.", 200, false, string.Empty);
                }

                var enrolledProgram = await _unitOfWork.ProgramEnrollment.GetByConditionAsync(p => p.StudentId == userId && p.ProgramId == programId);
                if (enrolledProgram != null)
                {
                    return new ResponseDTO("You have enrolled this program", 200, false, string.Empty);
                }

                var newEnrollment = new ProgramEnrollment
                {
                    ProgramId = programId,
                    StudentId = userId,
                    EnrolledAt = DateTime.Now,
                    CreateAt = DateTime.Now,
                };

                await _unitOfWork.ProgramEnrollment.AddAsync(newEnrollment);
                program.CurrentCapacity += 1;
                await _unitOfWork.TargetProgram.UpdateAsync(program);
                await _unitOfWork.SaveChangeAsync();
                return new ResponseDTO("Enrolled success", 200, true, string.Empty);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }
        public async Task<ResponseDTO> GetStudentsInTargetProgramAsync(Guid programId, int page, int pageSize)
        {
            try
            {
                var targetProgram = await _unitOfWork.TargetProgram.GetByConditionAsync(t => t.ProgramId == programId);

                if (targetProgram == null) return new ResponseDTO("Invalid program.", 400, false, string.Empty);

                var query = _unitOfWork.ProgramEnrollment.GetEnrollmentsWithStudents(e => e.ProgramId == programId);

                int totalRecords = await query.CountAsync();

                var students = await query.Skip((page - 1) * pageSize).Take(pageSize)
                    .Select(s => new StudentDTO
                    {
                        Id = s.StudentId,
                        Name = s.Student.FullName,
                        Email = s.Student.Email,
                        Status = s.Status,
                    })
                    .ToListAsync();
                var response = new
                {
                    TotalRecords = totalRecords,
                    PageNumber = page,
                    PageSize = pageSize,
                    Students = students
                };
                return new ResponseDTO("Success", 200, true, response);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }
        public async Task<ResponseDTO> UpdateAttendanceAsync(List<AttendanceUpdateRequest> attendanceUpdateRequests)
        {
            try
            {
                if (attendanceUpdateRequests == null || attendanceUpdateRequests.Count == 0)
                {
                    return new ResponseDTO("No attendance data provided.", 400, false, string.Empty);
                }

                var studentIds = new HashSet<Guid>(attendanceUpdateRequests.Select(r => r.StudentId));
                var programIds = new HashSet<Guid>(attendanceUpdateRequests.Select(r => r.ProgramId));

                var attendances = await _unitOfWork.ProgramEnrollment.GetAllByListAsync(pe => programIds.Contains(pe.ProgramId) && studentIds.Contains(pe.StudentId));

                if (attendances == null || !attendances.Any())
                {
                    return new ResponseDTO("No matching attendance records found.", 404, false, string.Empty);
                }

                var requestDict = attendanceUpdateRequests.ToDictionary(r => (r.StudentId, r.ProgramId), r => r.StatusName);

                Parallel.ForEach(attendances, attendance =>
                {
                    if (requestDict.TryGetValue((attendance.StudentId, attendance.ProgramId), out var newStatus))
                    {
                        attendance.Status = newStatus;
                    }
                });

                await _unitOfWork.SaveChangeAsync();

                return new ResponseDTO("Attendance updated successfully for all students.", 200, true, string.Empty);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }
    }
}
