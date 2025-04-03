using BLL.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PsychoEduSystem.Controller
{
    [Route("api/admin")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IUserService _userService;
        public AdminController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpGet("total-users")]
        public async Task<IActionResult> GetTotalUserAsync()
        {
            var response = await _userService.GetTotalUserAsync();
            return Ok(response);
        }
        [HttpGet("total-parents")]
        public async Task<IActionResult> GetTotalParentAsync()
        {
            var response = await _userService.GetTotalParentAsync();
            return Ok(response);
        }
        [HttpGet("total-classes")]
        public async Task<IActionResult> GetTotalClassAsync()
        {
            var response = await _userService.GetTotalClassAsync();
            return Ok(response);
        }
        [HttpGet("total-target-programs")]
        public async Task<IActionResult> GetTotalTargetProramAsync()
        {
            var response = await _userService.GetTotalTargetProramAsync();
            return Ok(response);
        }
        [HttpGet("total-appointments")]
        public async Task<IActionResult> GetTotalAppointmentAsync()
        {
            var response = await _userService.GetTotalAppointmentAsync();
            return Ok(response);
        }
        [HttpGet("upcoming-appointments")]
        public async Task<IActionResult> GetUpcomingAppointmentsAsync()
        {
            var response = await _userService.GetUpcomingAppointmentsAsync();
            return Ok(response);
        }
    }
}
