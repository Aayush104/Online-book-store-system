using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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

        public async Task DeleteBook(Book book)
        {
            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Book>> GetBestSellersBooks()
        {
            var topBookIds = await _context.OrderItems
                .Where(oi => oi.Order != null && oi.Order.Status == "Completed")
                .GroupBy(oi => oi.BookId)
                .OrderByDescending(g => g.Sum(oi => oi.Quantity))
                .Take(4)
                .Select(g => g.Key)
                .ToListAsync();

            var books = await _context.Books
                .Where(b => topBookIds.Contains(b.BookId))
                .ToListAsync();

            books = topBookIds
                .Select(id => books.First(b => b.BookId == id))
                .ToList();

            return books;
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

        public async Task<List<Book>> GetBooksAsync(BookFilterParams filterParams)
        {
            var query = _context.Books.AsQueryable();

            // Search by title, author, ISBN, or description
            if (!string.IsNullOrWhiteSpace(filterParams.Search))
            {
                query = query.Where(b =>
                    b.Title.Contains(filterParams.Search) ||
                    b.Author.Contains(filterParams.Search) ||
                    b.ISBN.Contains(filterParams.Search) ||
                    b.Description.Contains(filterParams.Search));
            }

            //  Filter by genre
            if (!string.IsNullOrWhiteSpace(filterParams.Genre))
            {
                query = query.Where(b => b.Genre == filterParams.Genre);
            }

            //  Filter by author
            if (!string.IsNullOrWhiteSpace(filterParams.Author))
            {
                query = query.Where(b => b.Author == filterParams.Author);
            }

            // Filter by publisher
            if (!string.IsNullOrWhiteSpace(filterParams.Publisher))
            {
                query = query.Where(b => b.Publisher == filterParams.Publisher);
            }

            // Filter by language
            if (!string.IsNullOrWhiteSpace(filterParams.Language))
            {
                query = query.Where(b => b.Language == filterParams.Language);
            }

            //  Filter by stock
            if (filterParams.InStock.HasValue && filterParams.InStock.Value)
            {
                query = query.Where(b => b.Stock > 0);
            }

            // Filter by library availability
            if (filterParams.InLibrary.HasValue)
            {
                query = query.Where(b => b.IsAvailableInLibrary == filterParams.InLibrary.Value);
            }

            //  Filter by price range
            if (filterParams.MinPrice.HasValue)
            {
                query = query.Where(b => b.Price >= filterParams.MinPrice.Value);
            }

            if (filterParams.MaxPrice.HasValue)
            {
                query = query.Where(b => b.Price <= filterParams.MaxPrice.Value);
            }

            // Filter by format (e.g., paperback, hardcover, collector’s, etc.)
            if (!string.IsNullOrWhiteSpace(filterParams.Format))
            {
                query = query.Where(b => b.Format == filterParams.Format);
            }

            //  Sorting
            query = filterParams.SortBy?.ToLower() switch
            {
                "title" => filterParams.SortOrder == "desc" ? query.OrderByDescending(b => b.Title) : query.OrderBy(b => b.Title),
                "price" => filterParams.SortOrder == "desc" ? query.OrderByDescending(b => b.Price) : query.OrderBy(b => b.Price),
                "publicationdate" => filterParams.SortOrder == "desc" ? query.OrderByDescending(b => b.PublicationDate) : query.OrderBy(b => b.PublicationDate),
                _ => query.OrderBy(b => b.Title) // default sorting
            };

            // Pagination
            return await query
                .Skip((filterParams.Page - 1) * filterParams.PageSize)
                .Take(filterParams.PageSize)
                .ToListAsync();
        }


        public async Task<Book> GetBooksById(int bookId)
        {
            return await _context.Books
                .Where(x => x.BookId == bookId)
                .FirstOrDefaultAsync();
        }

        public async Task<List<Book>> GetBooksByIdsAsync(IEnumerable<long> bookIds)
        {
            return await _context.Books
                        .Where(b => bookIds.Contains(b.BookId))
                        .ToListAsync();
        }

        public async Task<List<Book>> GetNewReleaseBooks()
        {
            var threeMonthsAgo = DateTime.UtcNow.AddMonths(-3);

            return await _context.Books
                .Where(b => b.PublicationDate >= threeMonthsAgo)
                .OrderByDescending(b => b.PublicationDate)
                .Take(4)
                .ToListAsync();
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

        public async Task<List<Book>> SpecialDealsBookAsync()
        {
            return await _context.Books
                .Where(b => b.OnSale && b.DiscountPercentage.HasValue)
                .OrderByDescending (b => b.DiscountPercentage)  
                .Take(4)   
                .ToListAsync(); 
        }

        public async Task UpdateBook(Book book)
        {
            _context.Books.Update(book);
            await _context.SaveChangesAsync();
        }

    }
}
