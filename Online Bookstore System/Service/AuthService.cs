using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Online_Bookstore_System.DataSecurity;
using Online_Bookstore_System.Dto.AuthDto;
using Online_Bookstore_System.Dto.ResponseDto;
using Online_Bookstore_System.Helper;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Model;
using System.Data;
using System.Net;

namespace Online_Bookstore_System.Service
{
    public class AuthService : IAuthService
    {
        //private readonly IAuthRepository _authService; 
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IDataProtector _dataProtector;
        private readonly IMailService _mailService;
        private readonly IOtpService _otpService;
        private readonly ITokenService _tokenService;

        public AuthService(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IDataProtectionProvider dataProtector, DataSecurityProvider securityProvider, IMailService mailService, IOtpService otpService, ITokenService tokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _mailService = mailService;
            _otpService = otpService;
            _tokenService = tokenService;
            _dataProtector = dataProtector.CreateProtector(securityProvider.securityKey);   
        }

        public async Task<ApiResponseDto> CreateStaffAsync(StaffRegistrationDto staffRegistrationDto)
        {
            try
            {
                var existingUser = await _userManager.FindByEmailAsync(staffRegistrationDto.Email);

                if (existingUser != null)
                {
                    return new ApiResponseDto { IsSuccess = false, Message = "A user with this email already exists.", StatusCode = 409 };
                }
                var user = new ApplicationUser
                {
                    FullName = staffRegistrationDto.FullName,
                    Email = staffRegistrationDto.Email,
                    UserName = staffRegistrationDto.Email,
                    PhoneNumber = staffRegistrationDto.PhoneNumber,
                    CreatedAt = DateTime.UtcNow,    
                };

                var result = await _userManager.CreateAsync(user);

                if (!result.Succeeded)
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = $"{ result.Errors}",
                        StatusCode = 400
                    };
                }

                await _userManager.AddToRoleAsync(user, "Staff");

                //Generate password reset Token
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var encodedToken = WebUtility.UrlEncode(token);


                var frontendUrl = Environment.GetEnvironmentVariable("Frontend__ResetPasswordUrl");
                var reset_url = $"{frontendUrl}?email={staffRegistrationDto.Email}&token={encodedToken}";

                await _mailService.SendResetMail(staffRegistrationDto.Email,staffRegistrationDto.FullName, reset_url);

                return new ApiResponseDto { IsSuccess = true, Message = "Staff created successfully.", StatusCode = 200};



            }
            catch (Exception ex)
            {

                return new ApiResponseDto { IsSuccess = false, Message = "An error occurred during staff Creation", StatusCode = 500, Data = ex.Message };
            }
        }

        public async Task<ApiResponseDto> LoginUserAsync(LoginDto loginDto)
        {
            try
            {
                var existingUser = await _userManager.FindByEmailAsync(loginDto.Email);
                if (existingUser == null)
                {
                    return new ApiResponseDto { IsSuccess = false, Message = "User is not registered", StatusCode = 404 };
                }

                var verifyExistingUser = await _userManager.CheckPasswordAsync(existingUser, loginDto.Password);
                if (!verifyExistingUser)
                {
                    return new ApiResponseDto { IsSuccess = false, Message = "Incorrect password. Please try again.", StatusCode = 401 };
                }

                var userRole = await _userManager.GetRolesAsync(existingUser);
                var role = userRole.FirstOrDefault();

                if (!existingUser.EmailConfirmed && role == "PublicUser")
                {
                    var otp = OtpGenerator.GenerateOtp();
                    await _otpService.StoreOtpAsync(existingUser.Id, "Registration", otp);
                    await _mailService.SendOtpMail(existingUser.Email, existingUser.FullName, otp);
                    return new ApiResponseDto { IsSuccess = false, Message = _dataProtector.Protect(existingUser.Id), StatusCode = 401 };
                }

                var token = _tokenService.GenerateToken(existingUser, userRole.ToList());
                return token != null
                    ? new ApiResponseDto { IsSuccess = true, Message = "Login successful", StatusCode = 200, Data = token }
                    : new ApiResponseDto { IsSuccess = false, Message = "An internal error occurred", StatusCode = 500 };

            }
            catch (Exception ex)
            {
                return new ApiResponseDto { IsSuccess = false, Message = "An error occurred during login", StatusCode = 500, Data = ex.Message };
            }
        }

        public async Task<ApiResponseDto> RegisterUserAsync(RegistrationDto registrationDto)
        {
            try
            {
                var existingEmail = await _userManager.FindByEmailAsync(registrationDto.Email);

                if (existingEmail != null)
                {
                    return new ApiResponseDto { IsSuccess = false, Message = "A user with this email already exists.", StatusCode = 409 };
                }

               

                var user = new ApplicationUser
                { 
                    FullName = registrationDto.FullName,
                    Email = registrationDto.Email,
                    UserName = registrationDto.Email,
                    PhoneNumber = registrationDto.PhoneNumber, 
                    Address = registrationDto.Address,
                    CreatedAt = DateTime.UtcNow,


                };

                var result = await _userManager.CreateAsync(user, registrationDto.Password);

                if (!result.Succeeded)
                {
                    string errors = string.Join("; ", result.Errors.Select(e => e.Description));
                    return new ApiResponseDto { IsSuccess = false, Message = $"User registration failed. {errors}", StatusCode = 400 };
                }
                var otp = OtpGenerator.GenerateOtp();
                await _otpService.StoreOtpAsync(user.Id, "Registration", otp);
                await _mailService.SendOtpMail(user.Email, user.FullName, otp);


                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(user, "PublicUser");
                }

                return new ApiResponseDto { IsSuccess = true, Message = "User created successfully.", StatusCode = 200, Data = _dataProtector.Protect(user.Id) };

            }
            catch (Exception ex)
            {
                return new ApiResponseDto { IsSuccess = false, Message = ex.Message, StatusCode = 500 };
            }
        }

        public async Task<ApiResponseDto> ResetPassowordAsync(ResetPasswordDto resetPasswordDto)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);

                if (user == null)
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "User is not registered.",
                        StatusCode = 404
                    };
                }

                var decodedToken = WebUtility.UrlDecode(resetPasswordDto.Token);

                var result = await _userManager.ResetPasswordAsync(user, decodedToken, resetPasswordDto.Password);

                if (result.Succeeded)

                {


                    user.EmailConfirmed = true;
                    await _userManager.UpdateAsync(user);
                    return new ApiResponseDto
                    {
                        IsSuccess = true,
                        Message = "Password reset successfully.",
                        StatusCode = 200
                    };
                }
                else
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = string.Join("; ", result.Errors.Select(e => e.Description)),
                        StatusCode = 400
                    };
                }
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while resetting the password. {ex.Message}",
                    StatusCode = 500
                };
            }
        }


    }
}
