using BLL.Interface;
using BLL.Service;
using Common.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PsychoEduSystem.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class SurveyController : ControllerBase
    {
        private readonly ISurveyService _surveyService;

        public SurveyController(ISurveyService surveyService)
        {
            _surveyService = surveyService;
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportSurvey(IFormFile file, [FromForm] SurveySettingsDTO settings)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("File is required.");
            }

            var result = await _surveyService.ImportSurveyFromExcel(file, settings);

            if (result == null)
            {
                return StatusCode(500, "An error occurred while importing the survey.");
            }

            return Ok(result);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSurvey(Guid id, [FromBody] UpdateSurveyDTO updateDto)
        {
            var result = await _surveyService.UpdateSurveyAsync(id, updateDto);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSurveys()
        {
            var surveys = await _surveyService.GetAllSurveysAsync();
            return Ok(surveys);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSurveyById(Guid id)
        {
            var survey = await _surveyService.GetSurveyByIdAsync(id);
            if (survey == null)
                return NotFound();
            return Ok(survey);
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetSurveyByUserId(Guid takerId, Guid targetId)
        {
            try
            {
                var result = await _surveyService.GetSurveyByUserIdAsync(takerId, targetId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitSurvey( [FromBody] SubmitSurveyRequestDTO request)
        {
            try
            {
                var result = await _surveyService.SubmitSurveyAsync( request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("user/{userId}/survey/{surveyId}/answers")]
        public async Task<IActionResult> GetUserSurveyAnswers(Guid userId, Guid surveyId)
        {
            try
            {
                var result = await _surveyService.GetUserSurveyAnswersAsync(userId, surveyId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("adjust/{surveyId}")]
        public async Task<IActionResult> AdjustSurvey(Guid surveyId)
        {
            try
            {
                var survey = await _surveyService.AdjustSurveyAsync(surveyId);
                if (survey == null)
                    return NotFound("Survey không tồn tại.");

                return Ok(survey);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi: {ex.Message}");
            }
        }

        // Endpoint để cập nhật survey với validation
        [HttpPut("update/{surveyId}")]
        public async Task<IActionResult> UpdateSurvey(Guid surveyId, [FromBody] SurveyWithQuestionsAndAnswersDTO updatedSurvey)
        {
            try
            {
                var result = await _surveyService.UpdateSurveyWithValidationAsync(surveyId, updatedSurvey);
                if (!result.IsSuccess)
                    return BadRequest(result.Message);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi: {ex.Message}");
            }
        }
        [HttpGet("results")]

        public async Task<IActionResult> GetSurveyResults([FromQuery] Guid Userid, [FromQuery] SurveyResultFilterDTO filter)
        {
            try
            {
                // Validate the Userid
                if (Userid == Guid.Empty)
                {
                    return BadRequest(new { Message = "Invalid User ID." });
                }

                // Call the service method to get survey results
                var results = await _surveyService.GetSurveyResults(Userid, filter);
                return Ok(results);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { Message = ex.Message }); // 403 Forbidden for unauthorized roles
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message }); // 500 Internal Server Error for other exceptions
            }
        }
    }
}
