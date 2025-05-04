using Microsoft.EntityFrameworkCore;
using Online_Bookstore_System.Data;
using Online_Bookstore_System.Dto.Pagination;
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

        public async Task<PagedResult<Book>> GetPaginatedBooksAsync(PaginationParams paginationParams)
        {
           var query = _context.Books.OrderBy(e => e.BookId).AsQueryable();

            var totaItems = await query.CountAsync();

            var totalPages = (int)Math.Ceiling(totaItems / (double)paginationParams.PageSize);


            var items = await query
                .Skip((paginationParams.Page-1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                 .ToListAsync(); 

            return new PagedResult<Book>
            {
                CurrentPage = paginationParams.Page,
                PageSize = paginationParams.PageSize,
                TotalItems = totaItems,
                TotalPages = totalPages,
                Items = items
            };
        }
    }
}
