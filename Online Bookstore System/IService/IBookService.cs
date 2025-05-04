using Online_Bookstore_System.Dto.AuthDto;
using Online_Bookstore_System.Dto.BookDto;
using Online_Bookstore_System.Dto.Pagination;
using Online_Bookstore_System.Dto.ResponseDto;

namespace Online_Bookstore_System.IService
{
    public interface IBookService
    {
        Task<ApiResponseDto> AddBookAsync(AddBookDto addBookDto);
        Task<ApiResponseDto> GetBooksAsync(PaginationParams paginationParams);

    }
}
