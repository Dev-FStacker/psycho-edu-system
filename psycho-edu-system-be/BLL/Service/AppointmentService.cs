using BLL.Interface;
using Common.DTO;
using DAL.Entities;
using DAL.UnitOfWork;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Service
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IUnitOfWork _unitOfWork;
        public AppointmentService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ResponseDTO> CreateAppointmentAsync(AppointmentRequestDTO request)
        {
            try
            {
                var bookedBy = await _unitOfWork.User.GetByIdAsync(request.BookedBy);
                var appointmentFor = await _unitOfWork.User.GetByIdAsync(request.AppointmentFor);
                var meetingWith = await _unitOfWork.User.GetByIdAsync(request.MeetingWith);

                if (bookedBy == null || appointmentFor == null || meetingWith == null)
                {
                    return new ResponseDTO("Required fields not found", 404, false, string.Empty);
                }

                var restrictedRoles = new HashSet<int> { 1, 2, 5 };

                if (restrictedRoles.Contains(bookedBy.RoleId))
                {
                    return new ResponseDTO("Only students or parents can book appointments. Please log in with the appropriate account.", 403, false, string.Empty);
                }

                var availableSchedule = await _unitOfWork.Schedule.GetByConditionAsync(s => s.UserId == meetingWith.UserId && s.Date == DateTime.Parse(request.Date.ToString()) && s.SlotId == request.SlotId);

                if (availableSchedule == null)
                {
                    return new ResponseDTO("Meeting date not valid", 400, false, string.Empty);
                }
                var slot = await _unitOfWork.Slot.GetByIdInt(request.SlotId);
                var bookedAppointment = await _unitOfWork.Appointment.GetByConditionAsync(s => s.SlotId == request.SlotId && s.Date == request.Date && s.MeetingWith == request.MeetingWith && s.IsCanceled == false);
                var bookedTargetProgram = await _unitOfWork.TargetProgram.GetByConditionAsync(t => t.StartDate == DateTime.Parse(request.Date.ToString() + " " + slot.SlotName) && t.CounselorId == request.MeetingWith);

                if (bookedAppointment != null)
                {
                    return new ResponseDTO("An appointment already exists for the selected date and slot.", 409, false, string.Empty);
                }

                if (bookedTargetProgram != null)
                {
                    return new ResponseDTO("A target program already exists for the selected date and slot.", 404, false, string.Empty);
                }

                var newAppointment = new Appointment
                {
                    AppointmentId = Guid.NewGuid(),
                    BookedBy = bookedBy.UserId,
                    AppointmentFor = appointmentFor.UserId,
                    MeetingWith = meetingWith.UserId,
                    Date = request.Date,
                    SlotId = request.SlotId,
                    GoogleMeet = string.Empty,
                    IsOnline = request.IsOnline,
                    Notes = string.Empty,
                    IsCompleted = false,
                    IsCanceled = false,
                    CreateAt = DateTime.Now,
                };

                await _unitOfWork.Appointment.AddAsync(newAppointment);
                var result = await _unitOfWork.SaveChangeAsync();

                if (result)
                {
                    return new ResponseDTO("Created appointment success", 200, true, string.Empty);
                }

                return new ResponseDTO("Failed to create appointment", 500, false, string.Empty);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }
        public Task<ResponseDTO> DeleteAppointmentAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<ResponseDTO> GetAppointmentFromRangeAsyncForConsultant(Guid consultantId, DateOnly selectedDate)
        {
            try
            {
                var user = await _unitOfWork.User.GetByIdAsync(consultantId);
                if (user == null)
                {
                    return new ResponseDTO("User not found.", 400, false, string.Empty);
                }

                var appointments = await _unitOfWork.Appointment.GetAllByListAsync(a =>
                    a.MeetingWith == consultantId && a.Date == selectedDate);

                if (appointments == null || !appointments.Any())
                {
                    return new ResponseDTO("No appointments found within the given date range.", 404, false, string.Empty);
                }

                CultureInfo cultureInfo = new CultureInfo("vi-VN");

                var appointmentList = appointments.Select(a => new AppointmentResponseDTO
                {
                    AppointmentId = a.AppointmentId,
                    MeetingWith = GetNameByUserId(a.MeetingWith).Item1,
                    AppointmentFor = GetNameByUserId(a.AppointmentFor).Item1,
                    GoogleMeetURL = GetNameByUserId(a.MeetingWith).Item2,
                    BookedBy = GetNameByUserId(a.BookedBy).Item1,
                    Date = a.Date.ToString("d", cultureInfo),
                    Notes = a.Notes,
                    SlotId = a.SlotId,
                    IsOnline = a.IsOnline,
                    IsCancelled = a.IsCanceled,
                    IsCompleted = a.IsCompleted,
                }).ToList();

                return new ResponseDTO("Appointments retrieved successfully.", 200, true, appointmentList);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"An error occurred: {ex.Message}", 500, false, string.Empty);
            }
        }

        public async Task<ResponseDTO> GetAppointmentFromRangeAsyncForStudent(Guid studentId, DateOnly selectedDate)
        {
            try
            {
                var user = await _unitOfWork.User.GetByIdAsync(studentId);
                if (user == null)
                {
                    return new ResponseDTO("User not found.", 400, false, string.Empty);
                }

                var appointments = await _unitOfWork.Appointment.GetAllByListAsync(a =>
                    a.AppointmentFor == studentId && a.Date == selectedDate);

                if (appointments == null || !appointments.Any())
                {
                    return new ResponseDTO("No appointments found within the given date range.", 404, false, string.Empty);
                }

                CultureInfo cultureInfo = new CultureInfo("vi-VN");

                var appointmentList = appointments.Select(a => new AppointmentResponseDTO
                {
                    AppointmentId = a.AppointmentId,
                    MeetingWith = GetNameByUserId(a.MeetingWith).Item1,
                    AppointmentFor = GetNameByUserId(a.AppointmentFor).Item1,
                    GoogleMeetURL = GetNameByUserId(a.MeetingWith).Item2,
                    BookedBy = GetNameByUserId(a.BookedBy).Item1,
                    Date = a.Date.ToString("d", cultureInfo),
                    Notes = a.Notes,
                    SlotId = a.SlotId,
                    IsOnline = a.IsOnline,
                    IsCancelled = a.IsCanceled,
                    IsCompleted = a.IsCompleted,
                }).ToList();

                return new ResponseDTO("Appointments retrieved successfully.", 200, true, appointmentList);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"An error occurred: {ex.Message}", 500, false, string.Empty);
            }
        }
        private (string, string) GetNameByUserId(Guid userId)
        {
            if (userId == Guid.Empty) return ("", "");

            var selectedUser = _unitOfWork.User.GetByIdAsync(userId);

            if (selectedUser == null) return ("", "");

            return (selectedUser.Result.FullName, selectedUser.Result.GoogleMeetURL);

        }
        public async Task<ResponseDTO> CancelAppointmentAsync(Guid AppointmentId)
        {
            try
            {
                var selectedAppointment = await _unitOfWork.Appointment.GetByIdAsync(AppointmentId);

                if (selectedAppointment == null) return new ResponseDTO("Appointment not found", 400, false, string.Empty);

                if (selectedAppointment.IsCompleted == true)
                {
                    return new ResponseDTO("Appointment has been completed", 400, false, string.Empty);
                }

                if (selectedAppointment.IsCanceled == false)
                {
                    selectedAppointment.IsCanceled = true;
                    _ = await _unitOfWork.SaveChangeAsync();
                } 
                else
                {
                    return new ResponseDTO("Appointment has already been cancelled", 400, false, string.Empty);
                }

                

                return new ResponseDTO("Appointment cancelled successfully", 200, true, string.Empty);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"An error occurred: {ex.Message}", 500, false, string.Empty);
            }
        }

        public async Task<ResponseDTO> GiveFeedbackAsync(Guid appointmentId, string notes)
        {
            try
            {
                var selectedAppointment = await _unitOfWork.Appointment.GetByIdAsync(appointmentId);

                if (selectedAppointment == null) return new ResponseDTO("Appointment not found", 400, false, string.Empty);

                if (selectedAppointment.IsCanceled == true) return new ResponseDTO("Appointment has been cancelled", 400, false, string.Empty);

                selectedAppointment.Notes = notes;
                await _unitOfWork.SaveChangeAsync();

                return new ResponseDTO("Update the feedback success", 400, false, string.Empty);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"An error occurred: {ex.Message}", 500, false, string.Empty);
            }
        }
    }
}
