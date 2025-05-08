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
    }
}
