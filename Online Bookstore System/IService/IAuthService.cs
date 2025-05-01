using Online_Bookstore_System.Dto.AuthDto;
using Online_Bookstore_System.Dto.ResponseDto;

namespace Online_Bookstore_System.IService
{
    public interface IAuthService
    {
        Task<ApiResponseDto> RegisterUserAsync(RegistrationDto registrationDto);
    }
}
