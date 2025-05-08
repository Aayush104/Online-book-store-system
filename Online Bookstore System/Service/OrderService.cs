using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
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
        private readonly IMailService _mailService;
        private readonly UserManager<ApplicationUser> _userManager;

        public OrderService(
            IOrderRepository orderRepository,
            IDataProtectionProvider dataProtector,
            DataSecurityProvider securityProvider,
            IMailService mailService,
            UserManager<ApplicationUser> userManager)
        {
            _orderRepository = orderRepository;
            _mailService = mailService;
            _userManager = userManager;
            _dataProtector = dataProtector.CreateProtector(securityProvider.securityKey);
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
