using Online_Bookstore_System.Dto.Pagination;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.IRepository
{
    public interface IBookRepository
    {
        Task<int> GetBookNumber();
        Task AddBook(Book book);
        Task<PagedResult<Book>> GetPaginatedBooksAsync(PaginationParams paginationParams);
        Task<Book> GetBooksById(int BookId);
        Task<List<Book>> GetBooksAsync(BookFilterParams filterParams);
    }
}
