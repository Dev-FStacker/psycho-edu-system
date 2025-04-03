using BLL.Interface;

using BLL.Services;
using Common.DTO;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;


namespace PsychoEduSystem.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
		 private readonly IGoogleAuthService _googleAuthService;
        private readonly ILoginService _loginService;

        public LoginController(ILoginService loginService,IGoogleAuthService googleAuthService)
        {
            _loginService = loginService;
						_googleAuthService = googleAuthService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDTO)
        {
            if (loginDTO == null || string.IsNullOrWhiteSpace(loginDTO.Account) || string.IsNullOrWhiteSpace(loginDTO.Password))
            {
                return BadRequest(new { Message = "Account and password are required." });
            }

            var response = await _loginService.LoginAsync(loginDTO.Account, loginDTO.Password);

            if (response.IsSuccess)
            {
                return Ok(response);
            }

            return StatusCode(response.StatusCode, response);
        }
				  [HttpPost("signin-google")]
        public async Task<IActionResult> SignInGoogle([FromBody] GoogleAuthTokenDTO googleAuthToken)
        {
            var result = await _googleAuthService.GoogleSignIn(googleAuthToken);

            if (result.IsSuccess)
            {
                return Ok(result);
            }
            return BadRequest(new { message = "Login failed" });
        }
    }


}
