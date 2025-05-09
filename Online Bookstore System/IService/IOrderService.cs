using Online_Bookstore_System.Dto.OrderDto;
using Online_Bookstore_System.Dto.ResponseDto;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.IService
{
    public interface IOrderService
    {
        Task<ApiResponseDto> PlaceOrderAsync(string userId, PlaceOrderDto request);
        Task<ApiResponseDto> GetAllOrderAsync();
        Task<ApiResponseDto> GetOrderNotificationAsync(string userId);
        Task<ApiResponseDto> GetAllCompletedOrderAsync();
        Task<ApiResponseDto> GetAllOrderByIdAsync(string userId);
        Task<ApiResponseDto> GetOrderbyClaimCode(string claimCode);
        Task<ApiResponseDto> CancelOrderAsync(string userId, int orderId);
        Task<ApiResponseDto> CompleteOrderAsync(CompleteOrderDto completeOrderDto);



    }
}
