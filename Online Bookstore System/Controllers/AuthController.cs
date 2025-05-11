using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

using Online_Bookstore_System.Dto.AuthDto;
using Online_Bookstore_System.Dto.ResponseDto;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Service;

namespace Online_Bookstore_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {

        private readonly IAuthService _authService;
        private readonly IOtpService _otpService;

        public AuthController(IAuthService authService, IOtpService otpService)
        {
            _authService = authService;
            _otpService = otpService;
        }


        [HttpPost("RegisterUser")]
        public async Task<IActionResult> RegisterUser(RegistrationDto registrationDto)
        {

            var response = await _authService.RegisterUserAsync(registrationDto);
            return StatusCode(response.StatusCode, response);

        }

        [HttpPost("VerifyOtp")]
        public async Task<IActionResult> VerifyOtp(OtpVerificationDto otpVerification)

        {

            //frontend bata body ma data pathauda Purpose = "Registration"   esari pathauney 

            var isValidOtp = await _otpService.verifyOtpAsync(otpVerification.UserId, otpVerification.Otp, otpVerification.Purpose);

            if (isValidOtp)
            {
                var response = new ApiResponseDto
                {
                    IsSuccess = true,
                    StatusCode = StatusCodes.Status200OK,
                    Message = "OTP verified successfully."
                };

                return Ok(response);
            }

            var errorResponse = new ApiResponseDto
            {
                IsSuccess = false,
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "Invalid or expired OTP."
            };

            return BadRequest(errorResponse);
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var response = await _authService.LoginUserAsync(loginDto);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost("CreateStaff")]
        public async Task<IActionResult> CreateStaff(StaffRegistrationDto staffRegistrationDto)
        {
            var response = await _authService.CreateStaffAsync(staffRegistrationDto);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost("ResetPassword")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto resetPasswordDto)
        {
            var response = await _authService.ResetPassowordAsync(resetPasswordDto);
            return StatusCode(response.StatusCode, response);
        }

        [HttpGet("GetAllStaff")]

        public async Task<IActionResult> GetAllStaff()
        {
            var response = await _authService.GetStaffAsync();
            return StatusCode(response.StatusCode, response);
        }

        [HttpPut("SetStaffStatus/{userId}")]

        public async Task<IActionResult> SetStaffStatus(string userId)
        {
            var response = await _authService.SetStaffStatusAsync(userId);
            return StatusCode(response.StatusCode, response);
        }
    }
}
