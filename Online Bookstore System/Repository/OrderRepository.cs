using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Online_Bookstore_System.Data;
using Online_Bookstore_System.DataSecurity;
using Online_Bookstore_System.Dto.OrderDto;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.Model;
using System;

namespace Online_Bookstore_System.Repository
{
    public class OrderRepository : IOrderRepository
    {
        private readonly AppDbContext _appDbContext;
        private readonly IDataProtector _dataProtector;
        public OrderRepository(AppDbContext appDbContext, IDataProtectionProvider dataProtector, DataSecurityProvider securityProvider)
        {
            _appDbContext = appDbContext;
            _dataProtector = dataProtector.CreateProtector(securityProvider.securityKey);
        }
        public async Task AddOrderAsync(Order order)
        {
            _appDbContext.Orders.Add(order);
            await _appDbContext.SaveChangesAsync();


        }

        public async Task<bool> CancelOrderAsync(string userId, int orderId)
        {
            var order = await _appDbContext.Orders
                .FirstOrDefaultAsync(x => x.UserId == userId && x.OrderId == orderId);

            if (order == null)
                return false;

            order.Status = "Cancelled";

            _appDbContext.Orders.Update(order);
            await _appDbContext.SaveChangesAsync();

            return true;
        }
        public async Task<(string UserId, List<OrderItem> OrderItems)> CompleteOrderAsync(string claimCode)
        {
            if (string.IsNullOrWhiteSpace(claimCode))
                throw new ArgumentException("Claim code must be provided.", nameof(claimCode));

            var order = await _appDbContext.Orders
                                 .FirstOrDefaultAsync(o => o.ClaimCode == claimCode);

            if (order == null)
                throw new InvalidOperationException("Order not found for the provided claim code.");

            order.Status = "Completed";
            order.OrderCompletedDate = DateTime.UtcNow;

            _appDbContext.Orders.Update(order);
            await _appDbContext.SaveChangesAsync();

            var items = await _appDbContext.OrderItems
                                 .Where(oi => oi.OrderId == order.OrderId)
                                 .ToListAsync();

            return (order.UserId, items);
        }



        public async  Task<List<GetAllOrderDto>> GetAllOrderByClaimCode(string claimCode)
        {
            var orders = await _appDbContext.Orders
              .Where(o => o.ClaimCode == claimCode)
              .Include(o => o.User)

              .Include(o => o.OrderItems)
              .ThenInclude(oi => oi.Book)
              .ToListAsync();

            var result = orders.Select(order => new GetAllOrderDto
            {
                OrderId = order.OrderId,
                ClaimCode = order.ClaimCode,
                Status = order.Status,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                FullName = order.User.FullName,
                Email = order.User.Email,
                DiscountApplied = order.DiscountApplied,
                OrderItems = order.OrderItems.Select(item => new GetOrderItemDto
                {
                    BookId = _dataProtector.Protect(item.Book.BookId.ToString()),
                    BookTitle = item.Book.Title,
                    BookAuthor = item.Book.Author,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    Photo = item.Book.BookPhoto

                }).ToList()
            }).ToList();

            return result;
        }

        public async Task<List<GetAllOrderDto>> GetAllOrderById(string userId)
        {
            var orders = await _appDbContext.Orders
               .Where(o => o.UserId == userId)
                 .Include(O => O.User)
               .Include(o => o.OrderItems)
               .ThenInclude(oi => oi.Book)
               .ToListAsync();

            var result = orders.Select(order => new GetAllOrderDto
            {
                OrderId = order.OrderId,
                ClaimCode = order.ClaimCode,
                Status = order.Status,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                FullName = order.User.FullName,
                Email = order.User.Email,
                DiscountApplied = order.DiscountApplied,
                OrderItems = order.OrderItems.Select(item => new GetOrderItemDto
                {
                    BookId = _dataProtector.Protect(item.Book.BookId.ToString()),
                    BookTitle = item.Book.Title,
                    BookAuthor = item.Book.Author,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    Photo = item.Book.BookPhoto

                }).ToList()
            }).ToList();

            return result;
        }

        public async Task<List<GetAllOrderDto>> GetAllPendingOrder()
        {
            var orders = await _appDbContext.Orders
               .Include(O => O.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
                .ToListAsync();

            var result = orders.Select(order => new GetAllOrderDto
            {
                OrderId = order.OrderId,
                ClaimCode = order.ClaimCode,
                Status = order.Status,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                FullName = order.User.FullName,
                Email = order.User.Email,
                DiscountApplied = order.DiscountApplied,
                OrderItems = order.OrderItems.Select(item => new GetOrderItemDto
                {
                    BookId = _dataProtector.Protect(item.Book.BookId.ToString()),
                    BookTitle = item.Book.Title,
                    BookAuthor = item.Book.Author,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    Photo = item.Book.BookPhoto

                }).ToList()
            }).ToList();

            return result; 
        }

        public async Task<List<Order>> GetAllUserCompletedOrder()
        {
            var orders = await _appDbContext.Orders
                .Where(o => o.Status == "Completed")
                .ToListAsync();

            return orders;
           
        }



        public async Task<int> GetSuccessfulOrderCountAsync(string memberId)
        {
            return await _appDbContext.Orders
     .CountAsync(o => o.UserId == memberId && o.Status == "Completed");

        }



      

}
}
