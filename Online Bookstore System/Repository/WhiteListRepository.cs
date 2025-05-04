using Microsoft.EntityFrameworkCore;
using Online_Bookstore_System.Data;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.Repository
{
    public class WhiteListRepository : IWhiteListRepository
    {
        private readonly AppDbContext _context;

        public WhiteListRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddWhiteListAsync(string userId, long bookId)
        {
            var bookmark = new Bookmark
            {
                UserId = userId,
                BookId = bookId,
                BookmarkedOn = DateTime.UtcNow
            };

            _context.BookMarks.AddAsync(bookmark);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Bookmark>> GetBookmarksAsync(string userId)
        {
            return await _context.BookMarks
         .Where(b => b.UserId == userId)
         .Include(b => b.Book) // Load related Book data
         .ToListAsync();
        }

        public async Task<bool> RemoveBookmarkAsync(string userId, long bookId)
        {
            var bookmark = await _context.BookMarks
                .FirstOrDefaultAsync(b => b.UserId == userId && b.BookId == bookId);

            if (bookmark == null) return false;

            _context.BookMarks.Remove(bookmark);
            await _context.SaveChangesAsync();
            return true;
        }

    }
}
