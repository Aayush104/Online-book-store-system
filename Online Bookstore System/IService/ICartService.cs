using Online_Bookstore_System.Dto.CartDto;
using Online_Bookstore_System.Dto.ResponseDto;

namespace Online_Bookstore_System.IService
{
    public interface ICartService
    {
        Task <ApiResponseDto> AddToCartAsync(string memberId, AddToCartRequestDto request);
        Task<ApiResponseDto> GetUserCartAsync(string memberId);

        Task<ApiResponseDto> RemoveFromCartAsync(string memberId, RemoveCartItemRequestDto request);

    }
}
