using BLL.Interface;
using Common.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PsychoEduSystem.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScheduleController : ControllerBase
    {
        private readonly IScheduleService _scheduleService;

        public ScheduleController(IScheduleService scheduleService)
        {
            _scheduleService = scheduleService;
        }

        [HttpPost("book-slots")]
        public async Task<IActionResult> BookSlots([FromBody] BookSlotRequest request)
        {
            return await _scheduleService.BookSlots(request);
        }

        [HttpGet("user-schedules/{userId}")]
        public async Task<IActionResult> GetUserSchedules(Guid userId)
        {
            return await _scheduleService.GetUserSchedules(userId);
        }

        [HttpGet("available-slots/{date}")]
        public async Task<IActionResult> GetAvailableSlots(DateTime date)
        {
            return await _scheduleService.GetAvailableSlots(date);
        }
    }
}
