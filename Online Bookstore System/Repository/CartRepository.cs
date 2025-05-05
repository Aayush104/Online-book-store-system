using Microsoft.EntityFrameworkCore;
using Online_Bookstore_System.Data;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.Repository
{
    public class CartRepository : ICartRepository
    {
        private readonly AppDbContext _context;
        public CartRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddCartItemAsync(Cart cartItem)
        {
             _context.Carts.AddAsync(cartItem);
            await _context.SaveChangesAsync();
        }

        public async Task<Cart> GetCartItemAsync(string memberId, long bookId)
        {
            return await _context.Carts
            .FirstOrDefaultAsync(ci => ci.UserId == memberId && ci.BookId == bookId);
        }

        public async Task<List<Cart>> GetCartItemsByUserIdAsync(string memberId)
        {
            return await _context.Carts
       .Include(c => c.Book)
       .Where(c => c.UserId == memberId)
       .ToListAsync();
        }

        public async Task RemoveCartItemAsync(Cart cartItem)
        {
            _context.Carts.Remove(cartItem);
            await _context.SaveChangesAsync();
        }


        public async Task UpdateCartItemAsync(Cart cartItem)
        {
            _context.Carts.Update(cartItem);
            await _context.SaveChangesAsync();

        }
    }
}
