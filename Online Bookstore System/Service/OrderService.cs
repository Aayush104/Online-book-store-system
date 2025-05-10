using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Online_Bookstore_System.Data;
using Online_Bookstore_System.DataSecurity;
using Online_Bookstore_System.Dto.OrderDto;
using Online_Bookstore_System.Dto.ResponseDto;
using Online_Bookstore_System.Hubs;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Model;
using System.Net;

namespace Online_Bookstore_System.Service
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IDataProtector _dataProtector;
        private readonly IMailService _mailService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AppDbContext _dbContext;
     
        private readonly IHubContext<Notificationhub> _Context;

        public OrderService(
            IOrderRepository orderRepository,
            IDataProtectionProvider dataProtector,
            DataSecurityProvider securityProvider,
            IMailService mailService,
            UserManager<ApplicationUser> userManager, IHubContext<Notificationhub> Context, AppDbContext dbContext)
        {
            _orderRepository = orderRepository;
            _mailService = mailService;
            _userManager = userManager;
            _Context = Context;
            _dbContext = dbContext;
            _dataProtector = dataProtector.CreateProtector(securityProvider.securityKey);

        }

        public async Task<ApiResponseDto> CancelOrderAsync(string userId, int orderId)
        {
            try
            {
                var isCancelled = await _orderRepository.CancelOrderAsync(userId, orderId);

                if (!isCancelled)
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        StatusCode = 404,
                        Message = "No order found with the specified UserId and OrderId.",
                        Data = null
                    };
                }

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    StatusCode = 200,
                    Message = "Order cancelled successfully.",
                    Data = isCancelled
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    StatusCode = 500,
                    Message = $"An error occurred while cancelling the order: {ex.Message}",
                    Data = null
                };
            }
        }

        public async Task<ApiResponseDto> CompleteOrderAsync(CompleteOrderDto completeOrderDto)
        {
            try
            {
                var userId = await _orderRepository.CompleteOrderAsync(completeOrderDto.ClaimCode);

                if (userId == null)
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        StatusCode = 404,
                        Message = "No order found with the specified claim code.",
                        Data = null
                    };
                }

                var user = await _userManager.FindByIdAsync(userId);

                if (user == null)
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        StatusCode = 404,
                        Message = "User not found.",
                        Data = null
                    };
                }

                var fullName = user.FullName ?? "User"; 

                var notificationObject = new
                {
                    type = "Order",
                    content = "Order Completed",
                    id = Guid.NewGuid().ToString(),
                    timestamp = DateTime.UtcNow,
                    title = "Order Completed",
                    description = $"The order of {fullName} has been completed. Now it's your turn!"
                };

                await _Context.Clients.All.SendAsync("ReceiveNotification", notificationObject);

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    StatusCode = 200,
                    Message = "Order completed successfully.",
                    Data = userId
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    StatusCode = 500,
                    Message = $"An error occurred while completing the order: {ex.Message}",
                    Data = null
                };
            }
        }


        public async Task<ApiResponseDto> GetAllCompletedOrderAsync()
        {
            try
            {
                var orders = await _orderRepository.GetAllCompletedOrder();
                return new ApiResponseDto
                {
                    IsSuccess = true,
                    StatusCode = 200,
                    Message = "Orders retrieved successfully.",
                    Data = orders
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while retrieving orders: {ex.Message}",
                    StatusCode = 500
                };
            }
        }

        public async Task<ApiResponseDto> GetAllOrderAsync()
        {
            try
            {
                var orders = await _orderRepository.GetAllPendingOrder(); 
                return new ApiResponseDto
                {
                    IsSuccess = true,
                    StatusCode = 200,
                    Message = "Orders retrieved successfully.",
                    Data = orders
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while retrieving orders: {ex.Message}",
                    StatusCode = 500
                };
            }
        }

        public async Task<ApiResponseDto> GetAllOrderByIdAsync(string userId)
        {
            try
            {
                var orders = await _orderRepository.GetAllOrderById(userId);
                return new ApiResponseDto
                {
                    IsSuccess = true,
                    StatusCode = 200,
                    Message = "Orders retrieved successfully.",
                    Data = orders
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while retrieving orders: {ex.Message}",
                    StatusCode = 500
                };
            }
        }

        public async Task<ApiResponseDto> GetOrderbyClaimCode(string claimCode)
        {
            try
            {
                var orders = await _orderRepository.GetAllOrderByClaimCode(claimCode);
                return new ApiResponseDto
                {
                    IsSuccess = true,
                    StatusCode = 200,
                    Message = "Orders retrieved successfully.",
                    Data = orders
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while retrieving orders: {ex.Message}",
                    StatusCode = 500
                };
            }
        }
        public async Task<ApiResponseDto> GetOrderNotificationAsync(string userId)
        {
            try
            {
                // 1. Load the calling user
                var currentUser = await _userManager.FindByIdAsync(userId);
                if (currentUser == null || !currentUser.CreatedAt.HasValue)
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        StatusCode = 404,
                        Message = "User not found or creation date not set.",
                        Data = null
                    };

                var referenceDate = currentUser.CreatedAt.Value;

              
                var allCompleted = await _orderRepository.GetAllUserCompletedOrder();

                var recentOrders = allCompleted
                    .Where(o => o.OrderCompletedDate.HasValue
                             && o.OrderCompletedDate.Value > referenceDate
                             && o.UserId != userId)
                    .ToList();

                var notifications = new List<object>();

                foreach (var order in recentOrders)
                {
                   
                    var otherUser = await _userManager.FindByIdAsync(order.UserId);
                    if (otherUser == null)
                        continue;

                    var fullName = otherUser.FullName ?? "(Unnamed)";

                    
                    var completedAt = order.OrderCompletedDate.Value;

                    var notificationObject = new
                    {
                        type = "Order",
                        content = "Order Completed",
                        id = Guid.NewGuid().ToString(),
                        timestamp = completedAt,               
                        title = "Order Completed",
                        description = $"The order for {fullName} was completed on {completedAt:G}. Now Its your turn"
                    };

                    notifications.Add(notificationObject);
                }

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    StatusCode = 200,
                    Message = "Notifications generated successfully.",
                    Data = notifications
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    StatusCode = 500,
                    Message = $"An error occurred: {ex.Message}",
                    Data = null
                };
            }
        }


        public async Task<ApiResponseDto> PlaceOrderAsync(string userId, PlaceOrderDto request)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = "User ID is required.",
                    StatusCode = 400
                };
            }

            if (request == null || request.Items == null || !request.Items.Any())
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = "Invalid order request.",
                    StatusCode = 400
                };
            }

           
            var claimCode = Guid.NewGuid().ToString().Substring(0, 8);

            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                Status = "Pending",
                ClaimCode = claimCode,
                OrderItems = new List<OrderItem>()
            };

            decimal totalAmount = 0;
            int totalQuantity = 0;

            // Decrypt book IDs and calculate totals
            foreach (var item in request.Items)
            {
                long bookId;
                try
                {
                    string decryptedBookId = _dataProtector.Unprotect(item.BookId);
                    bookId = Convert.ToInt64(decryptedBookId);
                }
                catch
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Invalid or corrupted book identifier.",
                        StatusCode = 400
                    };
                }

                order.OrderItems.Add(new OrderItem
                {
                    BookId = bookId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice
                });

                totalAmount += item.Quantity * item.UnitPrice;
                totalQuantity += item.Quantity;
            }

           
            decimal discount = 0;
            var messageParts = new List<string>();

            // 5% discount on 5 or more books
            bool hasQuantityDiscount = totalQuantity >= 5;
            if (hasQuantityDiscount)
            {
                discount += 0.05m;
                messageParts.Add("5% discount for ordering 5 or more books");
            }

            // 10% loyalty discount on every 10th successful order
            int successfulOrders = await _orderRepository.GetSuccessfulOrderCountAsync(userId);
            bool hasLoyaltyDiscount = successfulOrders > 0 && successfulOrders % 10 == 0;
            if (hasLoyaltyDiscount)
            {
                discount += 0.10m;
                messageParts.Add("10% loyalty discount for completing 10 orders");
            }

          
            string discountMessage;
            if (messageParts.Any())
            {
                discountMessage = "You got a " + string.Join(" and a ", messageParts) + ".";
            }
            else
            {
                discountMessage = "No discount applied.";
            }

            // Calculate final amounts
            decimal discountAmount = totalAmount * discount;
            order.TotalAmount = totalAmount - discountAmount;
            order.DiscountApplied = discountAmount;

            // Send order confirmation email
            var user = await _userManager.FindByIdAsync(userId);
            var mailDto = new OrderMailDto
            {
                ToEmail = user.Email,
                FullName = user.FullName,
                ClaimCode = claimCode,
                OrderDate = DateTime.UtcNow,
                TotalBooks = totalQuantity,
                Subtotal = totalAmount,
                Discount = discountAmount,
                FinalAmount = order.TotalAmount
            };
            await _mailService.SendOrderMail(mailDto);

           
            await _orderRepository.AddOrderAsync(order);

            var bookIds = order.OrderItems.Select(oi => oi.BookId).ToList();

            
            var userCartItems = await _dbContext.Carts
                .Where(c => c.UserId == userId && bookIds.Contains(c.BookId))
                .ToListAsync();

           
            _dbContext.Carts.RemoveRange(userCartItems);
            await _dbContext.SaveChangesAsync();

            return new ApiResponseDto
            {
                IsSuccess = true,
                StatusCode = 200,
                Message = $"Order placed successfully. {discountMessage}",
                Data = new { DiscountAmount = order.DiscountApplied }
            };
        }
    }
}
