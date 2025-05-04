using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.IRepository
{
    public interface IBookRepository
    {
        Task<int> GetBookNumber();
        Task AddBook(Book book);
    }
}
