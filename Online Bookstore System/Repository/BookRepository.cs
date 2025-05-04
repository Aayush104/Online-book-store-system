using Microsoft.EntityFrameworkCore;
using Online_Bookstore_System.Data;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.Repository
{
    public class BookRepository : IBookRepository
    {
        private readonly AppDbContext _context;

        public BookRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddBook(Book book)
        {
            _context.Books.Add(book);
            await _context.SaveChangesAsync();
        }

        public async Task<int> GetBookNumber()
        {
            if (await _context.Books.AnyAsync())
            {
                var maxId = await _context.Books.MaxAsync(e => e.BookId);
                return (int)(maxId + 1); 
            }

            return 1;
        }
    }
}
