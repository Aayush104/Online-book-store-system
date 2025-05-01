using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

using Online_Bookstore_System.Dto.AuthDto;
using Online_Bookstore_System.IService;

namespace Online_Bookstore_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {

        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }


        [HttpPost("RegisterUser")]
        public async Task<IActionResult> RegisterUser(RegistrationDto registrationDto)
        {

            var response = await _authService.RegisterUserAsync(registrationDto);
            return StatusCode(response.StatusCode, response);

        }
    }
}
