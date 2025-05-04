using Online_Bookstore_System.Dto.BookDto;
using Online_Bookstore_System.Dto.ResponseDto;

namespace Online_Bookstore_System.IService
{
    public interface IWhiteListService
    {
        Task<ApiResponseDto> AddWhiteListAsync(string BookId, string userId);
        Task<ApiResponseDto> GetWhiteListAsync( string userId);
    }
}
