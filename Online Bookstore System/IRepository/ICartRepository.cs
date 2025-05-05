using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.IRepository
{
    public interface ICartRepository
    {
        Task<Cart> GetCartItemAsync(string memberId, long bookId);
        Task AddCartItemAsync(Cart cartItem);
        Task<List<Cart>> GetCartItemsByUserIdAsync(string memberId);
        Task UpdateCartItemAsync(Cart cartItem);

        Task RemoveCartItemAsync(Cart cartItem);

    }
}
