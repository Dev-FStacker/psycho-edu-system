using BLL.Interface;
using BLL.Service;
using Common.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PsychoEduSystem.Controller
{
    [Route("api/appointments")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;
        public AppointmentController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }
        [HttpPost]
        public async Task<IActionResult> CreateAppointment([FromBody] AppointmentRequestDTO request)
        {
            if (!ModelState.IsValid)
                return Ok(new ResponseDTO("Invalid request data.", 400, false, null));

            if (request.BookedBy == Guid.Empty || request.AppointmentFor == Guid.Empty || request.MeetingWith == Guid.Empty)
                return Ok(new ResponseDTO("Invalid user ID.", 400, false, null));

            if (request.Date == default)
                return Ok(new ResponseDTO("Invalid date.", 400, false, null));

            var response = await _appointmentService.CreateAppointmentAsync(request);
            return Ok(response);
        }
        [HttpGet("{appointmentId}/cancellation")]
        public async Task<IActionResult> CancelAppointment(Guid appointmentId)
        {
            if (appointmentId.Equals(Guid.Empty))
                return Ok(new ResponseDTO("Invalid appointment ID", 400, false, null));

            var response = await _appointmentService.CancelAppointmentAsync(appointmentId);
            return Ok(response);
        }
        [HttpGet("students/{studentId}/appointments")]
        public async Task<IActionResult> GetAppointmentsForStudent(Guid studentId, [FromQuery] DateOnly selectedDate)
        {
            if (studentId == Guid.Empty)
                return Ok(new ResponseDTO("Invalid student ID.", 400, false, null));

            var response = await _appointmentService.GetAppointmentFromRangeAsyncForStudent(studentId, selectedDate);
            return Ok(response);
        }
        [HttpGet("consultants/{consultantId}/appointments")]
        public async Task<IActionResult> GetAppointmentsForConsultant(Guid consultantId, [FromQuery] DateOnly selectedDate)
        {
            if (consultantId == Guid.Empty)
                return Ok(new ResponseDTO("Invalid consultant ID.", 400, false, null));

            var response = await _appointmentService.GetAppointmentFromRangeAsyncForConsultant(consultantId, selectedDate);
            return Ok(response);
        }
        [HttpPost("{appointmentId}/feedback")]
        public async Task<IActionResult> GiveFeedback(Guid appointmentId, [FromBody] FeedbackRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Notes))
                return Ok(new ResponseDTO("Feedback notes cannot be empty", 400, false, null));

            var result = await _appointmentService.GiveFeedbackAsync(appointmentId, request.Notes);
            return Ok(result);
        }
    }
}
