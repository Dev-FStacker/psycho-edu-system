using BLL.Interface;
using Common.DTO;
using DAL.Entities;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace PsychoEduSystem.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("username/{userName}")]
        public async Task<IActionResult> GetUserByUserNameAsync(string userName)
        {
            var user = await _userService.GetUserByUserNameAsync(userName);
            if (user == null)
                return Ok(new { Message = "User not found", IsSuccess = false });
            return Ok(new { Result = user, IsSuccess = true });
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUserAsync(UserRegisterDTO newUserDTO)
        {
            var existingUserByUserName = await _userService.GetUserByUserNameAsync(newUserDTO.UserName);
            var existingUserByEmail = await _userService.GetUserByEmailAsync(newUserDTO.Email);

            if (existingUserByUserName != null)
                return Ok(new { Message = "User with this username already exists", IsSuccess = false });
            if (existingUserByEmail != null)
                return Ok(new { Message = "User with this email already exists", IsSuccess = false });

            var result = await _userService.RegisterUserAsync(newUserDTO);
            if (result)
                return Ok(new { Message = "User registered successfully!", IsSuccess = true });
            return Ok(new { Message = "An error occurred during registration", IsSuccess = false });
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile(Guid userId)
        {
            if (Guid.Empty == userId)
                return Ok(new { Message = "User ID is required.", IsSuccess = false });

            var response = await _userService.GetUserProfile(userId);
            return Ok(response);
        }

        [HttpGet("check-existence")]
        public async Task<IActionResult> IsUserExistAsync([FromQuery] string userName, [FromQuery] string email)
        {
            var exists = await _userService.IsUserExistAsync(userName, email);
            if (exists)
                return Ok(new { Message = "User exists", IsSuccess = true });
            return Ok(new { Message = "User does not exist", IsSuccess = false });
        }

        [HttpPost("create-account")]
        public async Task<IActionResult> CreateParentAccount([FromBody] CreateAccountDTO accountDTO)
        {
            if (!ModelState.IsValid)
                return Ok(new { Message = "Invalid request data.", Errors = ModelState, IsSuccess = false });

            var (success, errors) = await _userService.CreateAccountAsync(accountDTO);
            if (!success)
                return Ok(new { Message = "Failed to create account.", Errors = errors, IsSuccess = false });
            return Ok(new { Message = "Account created successfully.", IsSuccess = true });
        }

        [HttpGet("{studentId}/class")]
        public async Task<IActionResult> RetrieveUserClassInfo(Guid studentId)
        {
            if (studentId == Guid.Empty)
                return Ok(new { Message = "Invalid student ID.", IsSuccess = false });

            var response = await _userService.RetrieveUserClassInfoAsync(studentId);
            if (response == null)
                return Ok(new { Message = "Class information not found for the given student ID.", IsSuccess = false });
            return Ok(new { Result = response, IsSuccess = true });
        }

        [HttpGet("{userId}/slots")]
        public async Task<IActionResult> GetAvailableSlots(Guid userId, [FromQuery] DateOnly selectedDate)
        {
            if (userId == Guid.Empty)
                return Ok(new { Message = "Invalid user ID.", IsSuccess = false });

            var response = await _userService.GetAvailableSlotsAsync(userId, selectedDate);
            return Ok(response);
        }

        [HttpPut("profile/{userId}")]
        public async Task<IActionResult> UpdateUserProfile(Guid userId, [FromBody] UpdateUserProfileDTO updateDto)
        {
            if (userId == Guid.Empty)
                return Ok(new { Message = "User ID is required.", IsSuccess = false });
            if (!ModelState.IsValid)
                return Ok(new { Message = "Invalid request data.", Errors = ModelState, IsSuccess = false });

            var response = await _userService.UpdateUserProfileAsync(userId, updateDto);
            return Ok(response);
        }

        [HttpGet("students")]
        public async Task<IActionResult> GetStudents()
        {
            var response = await _userService.GetStudentsAsync();
            return Ok(response);
        }
    }
}