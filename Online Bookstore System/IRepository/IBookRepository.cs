using Online_Bookstore_System.Dto.Pagination;
using Online_Bookstore_System.Model;
using Online_Bookstore_System.Repository;

namespace Online_Bookstore_System.IRepository
{
    public interface IBookRepository
    {
        Task<int> GetBookNumber();
        Task AddBook(Book book);
        Task<PagedResult<Book>> GetPaginatedBooksAsync(PaginationParams paginationParams);
        Task<Book> GetBooksById(int BookId);
        Task<List<Book>> GetBooksAsync(BookFilterParams filterParams);
        Task<List<Book>> GetNewReleaseBooks();
        Task<List<Book>> GetBestSellersBooks();
        Task<List<Book>> SpecialDealsBookAsync();
        Task UpdateBook(Book book);
        Task DeleteBook(Book book);

        Task<List<Book>> GetBooksByIdsAsync(IEnumerable<long> bookIds);

        Task UpdateBooksStockAsync(IEnumerable<Book> books);

    }
}
