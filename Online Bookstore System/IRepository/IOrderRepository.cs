using Online_Bookstore_System.Dto.OrderDto;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.IRepository
{
    public interface IOrderRepository
    {
        Task<int> GetSuccessfulOrderCountAsync(string memberId);
        Task AddOrderAsync(Order order);

        Task <List<GetAllOrderDto>> GetAllPendingOrder();
        Task <List<GetAllOrderDto>> GetAllCompletedOrder();
        Task <List<GetAllOrderDto>> GetAllOrderById(string userId);
        Task <List<GetAllOrderDto>> GetAllOrderByClaimCode(string claimCode);
        Task <bool> CancelOrderAsync(string userId, int OrderId);
    }
}
