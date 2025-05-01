using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Online_Bookstore_System.DataSecurity;
using Online_Bookstore_System.Dto.AuthDto;
using Online_Bookstore_System.Dto.ResponseDto;
using Online_Bookstore_System.Helper;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Model;
using System.Data;

namespace Online_Bookstore_System.Service
{
    public class AuthService : IAuthService
    {
        //private readonly IAuthRepository _authService; 
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IDataProtector _dataProtector;
        private readonly IMailService _mailService;
        public AuthService(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IDataProtectionProvider dataProtector, DataSecurityProvider securityProvider, IMailService mailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _mailService = mailService;
            _dataProtector = dataProtector.CreateProtector(securityProvider.securityKey);   
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

                var otp = OtpGenerator.GenerateOtp();

                var user = new ApplicationUser
                { 
                    FullName = registrationDto.FullName,
                    Email = registrationDto.Email,
                    UserName = registrationDto.Email,
                    PhoneNumber = registrationDto.PhoneNumber, 
                    Address = registrationDto.Address,
                    
                
                };

                var result = await _userManager.CreateAsync(user, registrationDto.Password);
                await _mailService.SendOtpMail(user.Email, user.FullName, otp);


                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(user, "PublicUser");
                }

                return new ApiResponseDto { IsSuccess = true, Message = "User created successfully.", StatusCode = 201, Data = _dataProtector.Protect(user.Id) };

            }
            catch (Exception ex)
            {
                return new ApiResponseDto { IsSuccess = false, Message = ex.Message, StatusCode = 500 };
            }
        }
    }
}
