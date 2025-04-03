using System;
using System.Diagnostics;
using System.Globalization;
using System.Net.WebSockets;
using System.Threading.Tasks;
using BLL.Interface;
using BLL.Utilities;
using Common.DTO;
using DAL.Entities;
using DAL.UnitOfWork;

using Microsoft.AspNetCore.Identity;

namespace BLL.Service
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserUtility _userUtility;

        public UserService(IUnitOfWork unitOfWork, UserUtility userUtility)
        {
            _unitOfWork = unitOfWork;
            _userUtility = userUtility;
        }

        public async Task<User> GetUserByUserNameAsync(string userName)
        {
            return await _unitOfWork.User.GetByEmailOrUserNameAsync(userName);
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _unitOfWork.User.GetUserByEmailAsync(email);
        }
        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new System.Security.Cryptography.HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }

        public async Task<bool> RegisterUserAsync(UserRegisterDTO newUserDTO)
        {
            if (await _unitOfWork.User.IsUserExistAsync(newUserDTO.UserName, newUserDTO.Email))
            {
                return false;
            }




            PasswordHashResultDTO passwordHashResult = _userUtility.CreateHashPassword(newUserDTO.Password);

            byte[] passwordHash, passwordSalt;
            CreatePasswordHash("123456", out passwordHash, out passwordSalt);


            var newUser = new User()
            {
                UserId = Guid.NewGuid(),
                UserName = newUserDTO.UserName,
                Email = newUserDTO.Email,
                Phone = newUserDTO.Phone,
                BirthDay = newUserDTO.BirthDay,
                Gender = newUserDTO.Gender,
                Address = newUserDTO.Address,
                PasswordHash = passwordHashResult.Hash,
                PasswordSalt = passwordHashResult.Salt,
          

            };

            await _unitOfWork.User.AddAsync(newUser);
            await _unitOfWork.SaveChangeAsync();
            return true;
        }

        public async Task<bool> IsUserExistAsync(string userName, string email)
        {
            return await _unitOfWork.User.IsUserExistAsync(userName, email);
        }
        public async Task<(bool Success, List<string> Errors)> CreateAccountAsync(CreateAccountDTO accountDTO)
        {
            var errors = new List<string>();
            using (var transaction = _unitOfWork.BeginTransaction(System.Data.IsolationLevel.ReadCommitted))
            {
                try
                {
                    bool isAccountCreated = false;

                    if (accountDTO.RoleName == "Teacher" || accountDTO.RoleName == "Psychologist")
                    {
                        (isAccountCreated, var workErrors) = await CreateWorkAccountAsync(accountDTO.UserName, accountDTO.Email, accountDTO.RoleName);
                        errors.AddRange(workErrors);
                    }
                    else if (accountDTO.RoleName == "Parent")
                    {
                        (isAccountCreated, var parentErrors) = await CreateParentAccountAsync(accountDTO);
                        errors.AddRange(parentErrors);
                    }
                    else
                    {
                        errors.Add("Invalid role name.");
                    }

                    if (!isAccountCreated)
                    {
                        transaction.Rollback();
                        return (false, errors);
                    }

                    await _unitOfWork.SaveChangeAsync();
                    transaction.Commit();
                    return (true, new List<string>());
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    errors.Add($"Error creating account: {ex.Message}");
                    return (false, errors);
                }
            }
        }
        private async Task<(bool Success, List<string> Errors)> CreateWorkAccountAsync(string username, string email, string roleName)
        {
            var errors = new List<string>();

            try
            {
                var (exists, checkErrors) = await CheckExistedAccount(username, email);
                errors.AddRange(checkErrors);
                if (exists)
                {
                    return (false, errors);
                }


                if (!TryGetRoleId(roleName, out int roleId) || (roleId != 2 && roleId != 5))
                {
                    errors.Add("Invalid role ID for work account.");
                    return (false, errors);
                }

                string autoGeneratedPassword = "12345";
                CreatePasswordHash(autoGeneratedPassword, out byte[] passwordHash, out byte[] passwordSalt);

                var newAccount = new User
                {
                    UserId = Guid.NewGuid(),
                    UserName = username,
                    Email = email,
                    PasswordHash = passwordHash,
                    PasswordSalt = passwordSalt,
                    IsEmailConfirmed = true,
                    CreateAt = DateTime.UtcNow,
                    RoleId = roleId,
                };

                await _unitOfWork.User.AddAsync(newAccount);
                return (true, new List<string>());
            }
            catch (Exception ex)
            {
                errors.Add($"Error creating work account: {ex.Message}");
                return (false, errors);
            }
        }
        private async Task<(bool Success, List<string> Errors)> CreateParentAccountAsync(CreateAccountDTO createAccountDTO)
        {
            var errors = new List<string>();

            try
            {
                var (exists, checkErrors) = await CheckExistedAccount(createAccountDTO.UserName, createAccountDTO.Email);
                errors.AddRange(checkErrors);
                if (exists)
                {
                    return (false, errors);
                }


                if (!TryGetRoleId(createAccountDTO.RoleName, out int roleId) || roleId != 4)
                {
                    errors.Add("Invalid role ID for parent account.");
                    return (false, errors);
                }

                string autoGeneratedPassword = "12345";
                CreatePasswordHash(autoGeneratedPassword, out byte[] passwordHash, out byte[] passwordSalt);

                var newAccount = new User
                {
                    UserId = Guid.NewGuid(),
                    UserName = createAccountDTO.UserName,
                    Email = createAccountDTO.Email,
                    PasswordHash = passwordHash,
                    PasswordSalt = passwordSalt,
                    IsEmailConfirmed = true,
                    CreateAt = DateTime.UtcNow,
                    RoleId = roleId,
                };

                await _unitOfWork.User.AddAsync(newAccount);

                if (createAccountDTO.StudentRelationships != null)
                {
                    var uniqueRelationships = createAccountDTO.StudentRelationships.GroupBy(r => r.StudentEmail)
                                                                                   .Select(g => g.First())
                                                                                   .ToList();

                    List<Relationship> relationshipsToAdd = new List<Relationship>();

                    foreach (var relationship in uniqueRelationships)
                    {
                        var student = await _unitOfWork.User.GetUserByEmailAsync(relationship.StudentEmail);
                        if (student == null)
                        {
                            errors.Add($"Student email {relationship.StudentEmail} not found.");
                            continue;
                        }

                        relationshipsToAdd.Add(new Relationship
                        {
                            RelationshipId = Guid.NewGuid(),
                            ParentId = newAccount.UserId,
                            StudentId = student.UserId,
                            RelationshipName = relationship.RelationshipName,
                            CreateAt = DateTime.UtcNow
                        });
                    }

                    if (relationshipsToAdd.Any())
                    {
                        await _unitOfWork.Relationship.AddRangeAsync(relationshipsToAdd);
                    }
                }

                return (true, errors);
            }
            catch (Exception ex)
            {
                errors.Add($"Error creating parent account: {ex.Message}");
                return (false, errors);
            }
        }
        private async Task<(bool Success, List<string> Errors)> CheckExistedAccount(string username, string email)
        {
            var errors = new List<string>();

            try
            {
                if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(email))
                {
                    errors.Add("Username or email is empty.");
                    return (false, errors);
                }

                bool exists = await _unitOfWork.User.AnyAsync(a => a.UserName == username || a.Email == email);
                if (exists)
                {
                    errors.Add("Username or email already exists.");
                    return (true, errors);
                }

                return (false, new List<string>());
            }
            catch (Exception ex)
            {
                errors.Add($"Error checking existing account: {ex.Message}");
                return (false, errors);
            }
        }
        private bool TryGetRoleId(string roleName, out int roleId)
        {
            var role = _unitOfWork.Role.GetByCondition(r => r.RoleName == roleName);
            roleId = role?.RoleId ?? 0;
            return role != null;
        }

        public async Task<ResponseDTO> RetrieveUserClassInfoAsync(Guid studentId)
        {
            try
            {
                var student = await _unitOfWork.User.GetByIdAsync(studentId);

                if (student == null)
                {
                    return new ResponseDTO("User not found", 404, false, string.Empty);
                }

                var classInfo = student?.ClassId != null ? await _unitOfWork.Class.GetByIdInt((int)student.ClassId) : null;
                if (classInfo == null)
                {
                    return new ResponseDTO("Class not found", 404, false, string.Empty);
                }

                var classDetail = new StudentClassResponseDTO
                {
                    ClassId = classInfo.ClassId,
                    ClassName = classInfo.Name,
                    TeacherId = classInfo.TeacherId,
                };
                
                return new ResponseDTO("Retrieve class success", 200, true, classDetail);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }

        public async Task<ResponseDTO> GetAvailableSlotsAsync(Guid userId, DateOnly selectedDate)
        {
            try
            {
                var date = DateTime.Parse(selectedDate.ToString());
                var userSchedules = await _unitOfWork.Schedule.GetAllByListAsync(s => s.UserId == userId && s.Date == date);

                if (userSchedules == null || !userSchedules.Any())
                    return new ResponseDTO("No schedules found for the user on this date.", 404, false, null);

                var slotIds = userSchedules.Select(s => s.SlotId).ToList();

                var bookedSlots = await _unitOfWork.Appointment.GetAllByListAsync(a => slotIds.Contains(a.SlotId) && a.Date == selectedDate);

                var availableSlots = slotIds.Except(bookedSlots.Select(s => s.SlotId)).ToList();

                if (!availableSlots.Any())
                    return new ResponseDTO("No available slots.", 404, false, null);

                return new ResponseDTO("Get available slots success", 200, true, availableSlots);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }

        public async Task<ResponseDTO> GetPsychologistsAsync()
        {
            try
            {
                var psychologists = await _unitOfWork.User.GetAllByListAsync(u => u.RoleId == 2);
                var list = psychologists.Select(p => new PsychologistResponseDTO
                {
                    UserId = p.UserId,
                    FirstName = p.FirstName,
                    LastName = p.LastName,
                    FullName = p.FullName,
                    PhoneNumber = p.Phone,
                    Email = p.Email,
                    BirthDay = p.BirthDay,
                    Gender = p.Gender,
                    Address = p.Address,
                });

                if (!list.Any()) return new ResponseDTO("No data available", 200, true, string.Empty);

                return new ResponseDTO("Retrieve psychologists successfully", 200, true, list);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }

        public async Task<ResponseDTO> GetUserProfile(Guid userId)
        {
            try
            {
                var user = await _unitOfWork.User.GetByIdAsync(userId);

                if (user == null) return new ResponseDTO("User not found", 400, false, string.Empty);

                CultureInfo cultureInfo = new CultureInfo("vi-VN");


                var profile = new UserProfileDTO
                {
                    FirstName = user.FirstName ?? "",
                    LastName = user.LastName ?? "",
                    FullName = user.FullName ?? "",
                    BirthDay = user.BirthDay.ToString("d", cultureInfo),
                    Gender = user.Gender,
                    Address = user.Address,
                    Email = user.Email,
                    Phone = user.Phone,
                };

                return new ResponseDTO("Get user profile successfully", 200, true, profile);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }
        public async Task<ResponseDTO> UpdateUserProfileAsync(Guid userId, UpdateUserProfileDTO updateDto)
        {
            try
            {
                if (updateDto == null)
                {
                    return new ResponseDTO("Invalid profile data", 400, false, string.Empty);
                }

                var user = await _unitOfWork.User.GetByIdAsync(userId);
                if (user == null)
                {
                    return new ResponseDTO("User not found", 404, false, string.Empty);
                }

                using (var transaction = _unitOfWork.BeginTransaction(System.Data.IsolationLevel.ReadCommitted))
                {
                    try
                    {
                        // Xử lý cập nhật password nếu có
                        if (!string.IsNullOrEmpty(updateDto.CurrentPassword) || !string.IsNullOrEmpty(updateDto.NewPassword))
                        {
                            // Cả hai trường phải được cung cấp nếu muốn đổi password
                            if (string.IsNullOrEmpty(updateDto.CurrentPassword) || string.IsNullOrEmpty(updateDto.NewPassword))
                            {
                                return new ResponseDTO("Both current and new passwords are required to update password", 400, false, string.Empty);
                            }

                            // Xác minh mật khẩu hiện tại
                            if (!VerifyPasswordHash(updateDto.CurrentPassword, user.PasswordHash, user.PasswordSalt))
                            {
                                return new ResponseDTO("Current password is incorrect", 400, false, string.Empty);
                            }

                            // Kiểm tra mật khẩu mới
                            if (updateDto.NewPassword.Length < 6)
                            {
                                return new ResponseDTO("New password must be at least 6 characters long", 400, false, string.Empty);
                            }

                            // Tạo hash và salt mới
                            byte[] newPasswordHash, newPasswordSalt;
                            CreatePasswordHash(updateDto.NewPassword, out newPasswordHash, out newPasswordSalt);
                            user.PasswordHash = newPasswordHash;
                            user.PasswordSalt = newPasswordSalt;
                        }

                        // Cập nhật các thông tin profile khác
                        if (!string.IsNullOrEmpty(updateDto.FirstName) && updateDto.FirstName.Length <= 30)
                        {
                            user.FirstName = updateDto.FirstName.Trim();
                        }
                        if (!string.IsNullOrEmpty(updateDto.LastName) && updateDto.LastName.Length <= 30)
                        {
                            user.LastName = updateDto.LastName.Trim();
                        }

                        if (!string.IsNullOrEmpty(updateDto.Phone))
                        {
                            if (!System.Text.RegularExpressions.Regex.IsMatch(updateDto.Phone, @"^(?:\+84|0)[3|5|7|8|9]\d{8}$"))
                            {
                                return new ResponseDTO("Invalid phone number format. Must be a valid Vietnamese phone number.", 400, false, string.Empty);
                            }
                            if (await _unitOfWork.User.AnyAsync(u => u.Phone == updateDto.Phone && u.UserId != userId))
                            {
                                return new ResponseDTO("Phone number already in use", 400, false, string.Empty);
                            }
                            user.Phone = updateDto.Phone;
                        }

                        if (updateDto.BirthDay.HasValue)
                        {
                            if (updateDto.BirthDay.Value > DateTime.UtcNow ||
                                updateDto.BirthDay.Value < DateTime.UtcNow.AddYears(-150))
                            {
                                return new ResponseDTO("Invalid birth date", 400, false, string.Empty);
                            }
                            user.BirthDay = updateDto.BirthDay.Value;
                        }

                        if (!string.IsNullOrEmpty(updateDto.Gender))
                        {
                            string[] validGenders = { "Male", "Female", "Other" };
                            if (!validGenders.Contains(updateDto.Gender))
                            {
                                return new ResponseDTO("Invalid gender value", 400, false, string.Empty);
                            }
                            user.Gender = updateDto.Gender;
                        }

                        if (!string.IsNullOrEmpty(updateDto.Address) && updateDto.Address.Length <= 200)
                        {
                            user.Address = updateDto.Address.Trim();
                        }

                        if (!string.IsNullOrEmpty(updateDto.FirstName) || !string.IsNullOrEmpty(updateDto.LastName))
                        {
                            user.FullName = $"{user.FirstName ?? ""} {user.LastName ?? ""}".Trim();
                            if (user.FullName.Length > 30)
                            {
                                return new ResponseDTO("Full name exceeds maximum length of 30 characters", 400, false, string.Empty);
                            }
                        }

                        await _unitOfWork.User.UpdateAsync(user);
                        await _unitOfWork.SaveChangeAsync();
                        transaction.Commit();

                        var updatedProfile = new UserProfileDTO
                        {
                            FirstName = user.FirstName ?? "",
                            LastName = user.LastName ?? "",
                            FullName = user.FullName ?? "",
                            BirthDay = user.BirthDay.ToString("d", new CultureInfo("vi-VN")),
                            Gender = user.Gender,
                            Address = user.Address,
                            Email = user.Email,
                            Phone = user.Phone
                        };

                        return new ResponseDTO("Profile updated successfully", 200, true, updatedProfile);
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return new ResponseDTO($"Error updating profile: {ex.Message}", 500, false, string.Empty);
                    }
                }
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }

        private bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
        {
            if (string.IsNullOrEmpty(password) || storedHash == null || storedSalt == null)
            {
                return false;
            }

            try
            {
                using (var hmac = new System.Security.Cryptography.HMACSHA512(storedSalt))
                {
                    var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                    return System.Security.Cryptography.CryptographicOperations.FixedTimeEquals(computedHash, storedHash);
                }
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<ResponseDTO> GetStudentsAsync()
        {
            try
            {
                var users = await _unitOfWork.User.GetAllByListAsync(u => u.RoleId == 3);
                if (users == null || !users.Any())
                {
                    return new ResponseDTO("No students found", 404, false, string.Empty);
                }
                var students = users.Select(u => new StudentDTO
                {
                    Id = u.UserId,
                    Email = u.Email,
                    Name = u.FullName,
                });
                return new ResponseDTO("Retrieve students successfully", 200, true, students);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }

        public async Task<ResponseDTO> GetTotalUserAsync()
        {
            try
            {
                var totalUser = _unitOfWork.User.GetAll().Count();
                return new ResponseDTO("Retrieve total user successfully", 200, true, totalUser);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }

        public async Task<ResponseDTO> GetTotalParentAsync()
        {
            try
            {
                var totalParent = _unitOfWork.User.GetAll().Count(u => u.RoleId == 4);
                return new ResponseDTO("Retrieve total parent successfully", 200, true, totalParent);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }

        public async Task<ResponseDTO> GetTotalClassAsync()
        {
            try
            {
                var totalClass = _unitOfWork.Class.GetAll().Count();
                return new ResponseDTO("Retrieve total class successfully", 200, true, totalClass);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }

        public async Task<ResponseDTO> GetTotalTargetProramAsync()
        {
            try
            {
                var totalTargetProgram = _unitOfWork.TargetProgram.GetAll().Count();
                return new ResponseDTO("Retrieve total target program successfully", 200, true, totalTargetProgram);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }

        public async Task<ResponseDTO> GetTotalAppointmentAsync()
        {
            try
            {
                var totalAppointment = _unitOfWork.Appointment.GetAll().Count();
                return new ResponseDTO("Retrieve total appointment successfully", 200, true, totalAppointment);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }

        public async Task<ResponseDTO> GetUpcomingAppointmentsAsync()
        {
            try
            {
                var appointments = _unitOfWork.Appointment.GetAll()
                    .AsEnumerable()
                    .Where(a => a.Date.ToDateTime(TimeOnly.MinValue) >= DateTime.UtcNow)
                    .Take(5)
                    .ToList();
                return new ResponseDTO("Retrieve upcoming appointments successfully", 200, true, appointments);
            }
            catch (Exception ex)
            {
                return new ResponseDTO($"Error: {ex.Message}", 500, false, string.Empty);
            }
        }
    }
    }

