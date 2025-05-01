using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Online_Bookstore_System.DataSecurity;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Model;
using Online_Bookstore_System.Repository;

namespace Online_Bookstore_System.Service
{
    public class OtpService : IOtpService
    {
        
        private readonly IOtpRepository _otprepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IDataProtector _dataProtector;
        public OtpService(IOtpRepository otprepository, UserManager<ApplicationUser> userManager, IDataProtectionProvider dataProtector, DataSecurityProvider securityProvider)
        {
            _otprepository = otprepository;
            _userManager = userManager;
            _dataProtector = dataProtector.CreateProtector(securityProvider.securityKey);
        }

        public Task StoreOtpAsync(string userId, string purpose, string otp)
        {
            if (userId == null)
            {
                throw new ArgumentNullException(nameof(userId));
            }

            if (purpose == null)
            {
                throw new ArgumentNullException(nameof(purpose));
            }

            if (otp == null)
            {
                throw new ArgumentNullException(nameof(otp));
            }


            Otp otpp = new()
            {

                UserId = userId,
                Purpose = purpose,
                IsOtp = otp,
                IsUsed = false,
                ExpiresAt = DateTime.UtcNow.AddMinutes(5)
            };

            _otprepository.AddOtp(otpp);
            return Task.CompletedTask;
        }

        public async Task<bool> verifyOtpAsync(string UserId, string Otp, string Purpose)
        {
            var unhashedUserId = _dataProtector.Unprotect(UserId);

            var latestOtp = await _otprepository.GetLatestOtp(unhashedUserId, Purpose);


            if (latestOtp == null || latestOtp.IsUsed || DateTime.UtcNow >= latestOtp.ExpiresAt)
            {
                return false;
            }

            if (latestOtp.IsOtp == Otp)
            {
                latestOtp.IsUsed = true;

                await _otprepository.UpdateOtp(latestOtp);



                var user = await _userManager.FindByIdAsync(unhashedUserId);

                if (user != null)
                {
                    if (Purpose == "Registration")
                    {
                        user.EmailConfirmed = true;
                        var result = await _userManager.UpdateAsync(user);

                        return result.Succeeded;
                    }
                }


                return true;
            }

            return false;

        }
    }
    
}
