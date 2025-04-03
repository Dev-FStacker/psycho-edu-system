using BLL.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Octokit;

namespace PsychoEduSystem.Controller
{
    [Route("api/psychologists")]
    [ApiController]
    public class PsychologistsController : ControllerBase
    {
        private readonly IUserService _userService;
        public PsychologistsController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpGet]
        public async Task<IActionResult> GetPsychologists()
        {
            try
            {
                var response = await _userService.GetPsychologistsAsync();
                if (response.IsSuccess)
                {
                    return Ok(response);
                }
                return NotFound(new { Message = "Psychologists not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while fetching psychologists.", Error = ex.Message });
            }
        }
    }
}
