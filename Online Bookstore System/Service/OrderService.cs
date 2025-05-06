using Microsoft.AspNetCore.DataProtection;
using Online_Bookstore_System.DataSecurity;
using Online_Bookstore_System.Dto.OrderDto;
using Online_Bookstore_System.Dto.ResponseDto;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.Service
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IDataProtector _dataProtector;

        public OrderService(IOrderRepository orderRepository, IDataProtectionProvider dataProtector, DataSecurityProvider securityProvider)
        {
            _orderRepository = orderRepository;
            _dataProtector = dataProtector.CreateProtector(securityProvider.securityKey);
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
            string discountMessage = "No discount applied.";

            // 5% discount on 5 or more books
            if (totalQuantity >= 5)
            {
                discount += 0.05m;
                discountMessage = "You got a 5% discount for ordering 5 or more books.";
            }

            // 10% discount on every 10th successful order
            int successfulOrders = await _orderRepository.GetSuccessfulOrderCountAsync(userId);
            if (successfulOrders > 0  && successfulOrders % 10 == 0)
            {
                discount += 0.10m;
                discountMessage = discount > 0.05m
                    ? "You got a 5% discount for ordering 5 or more books and an additional 10% loyalty discount for 10 completed orders."
                    : "You got a 10% loyalty discount for completing 10 orders.";
            }

            decimal discountAmount = totalAmount * discount;

            order.TotalAmount = totalAmount - discountAmount;
            order.DiscountApplied = discountAmount;

            await _orderRepository.AddOrderAsync(order);

            return new ApiResponseDto
            {
                IsSuccess = true,
                StatusCode = 200,
                Message = $"Order placed successfully. {discountMessage}",
                Data = new
                {  DiscountAmount = order.DiscountApplied
                }
            };
        }
    }
}
