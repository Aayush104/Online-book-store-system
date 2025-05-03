using Online_Bookstore_System.Dto.AuthDto;
using Online_Bookstore_System.Dto.ResponseDto;

namespace Online_Bookstore_System.IService
{
    public interface IAuthService
    {
        Task<ApiResponseDto> RegisterUserAsync(RegistrationDto registrationDto);
        Task<ApiResponseDto> LoginUserAsync(LoginDto loginDto);
        Task<ApiResponseDto> CreateStaffAsync(StaffRegistrationDto staffRegistrationDto);
        Task<ApiResponseDto> ResetPassowordAsync(ResetPasswordDto resetPasswordDto);
    }

}
