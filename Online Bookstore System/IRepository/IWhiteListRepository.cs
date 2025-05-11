using Online_Bookstore_System.Model;
using System.Threading.Tasks;

namespace Online_Bookstore_System.IRepository
{
    public interface IWhiteListRepository
    {
        Task AddWhiteListAsync(string userId, long bookId);
        Task<bool> GetValidationAsync(string userId, long bookId);
        Task<List<Bookmark>> GetBookmarksAsync(string userId);
        Task<bool> RemoveBookmarkAsync(string userId, long bookId);


    }
}
