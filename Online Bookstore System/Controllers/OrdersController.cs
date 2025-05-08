using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Online_Bookstore_System.Dto.OrderDto;
using Online_Bookstore_System.IService;

namespace Online_Bookstore_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }


        [HttpPost("PlaceOrder")]
        [Authorize(AuthenticationSchemes = "Bearer")]

        public async Task<IActionResult> PlaceOrder(PlaceOrderDto placeOrderDto)
        {

            var userIdClaim = HttpContext.User.FindFirst("userId");

            if (userIdClaim == null) return Unauthorized("User not found");

            var userId = userIdClaim?.Value;
            var response = await _orderService.PlaceOrderAsync(userId, placeOrderDto);

            return StatusCode(response.StatusCode, response);


        }

        [HttpGet("GetAllPendingOrders")]

        public async Task<IActionResult> GetAllPendingOrders()
        {

            var response = await _orderService.GetAllOrderAsync();
            return StatusCode(response.StatusCode, response);
        }


        [HttpGet("GetAllCompletedOrders")]

        public async Task<IActionResult> GetAllCompletedOrders()
        {

            var response = await _orderService.GetAllCompletedOrderAsync();
            return StatusCode(response.StatusCode, response);
        }


        [HttpGet("GetOrderById")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        public async Task<IActionResult> GetAllOrderById()
        {
            var userIdClaim = HttpContext.User.FindFirst("userId");

            if (userIdClaim == null) return Unauthorized("User not found");

            var userId = userIdClaim?.Value;

            var response = await _orderService.GetAllOrderByIdAsync(userId);
            return StatusCode(response.StatusCode, response);

        }

        [HttpGet("GetOrderbyClaimCode/{claimCode}")]

        public async Task<IActionResult> GetOrderbyClaimCode(string claimCode)
        {

            var response = await _orderService.GetOrderbyClaimCode(claimCode);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPut("CancelOrder/{orderId}")]
        [Authorize(AuthenticationSchemes = "Bearer")]

        public async Task<IActionResult> CancelOrder(int orderId)
        {
            var userIdClaim = HttpContext.User.FindFirst("userId");

            if (userIdClaim == null) return Unauthorized("User not found");

            var userId = userIdClaim?.Value;

            var response = await _orderService.CancelOrderAsync(userId, orderId);
            return StatusCode(response.StatusCode, response);

        }



    }


}
