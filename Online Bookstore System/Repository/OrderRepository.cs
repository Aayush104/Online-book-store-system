using Microsoft.EntityFrameworkCore;
using Online_Bookstore_System.Data;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.Repository
{
    public class OrderRepository : IOrderRepository
    {
        private readonly AppDbContext _appDbContext;
        public OrderRepository(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }
        public async Task AddOrderAsync(Order order)
        {
            _appDbContext.Orders.Add(order);
            await _appDbContext.SaveChangesAsync();
        }

        public async Task<int> GetSuccessfulOrderCountAsync(string memberId)
        {
            return await _appDbContext.Orders
     .CountAsync(o => o.UserId == memberId && o.Status == "Completed");

        }
    }
}
