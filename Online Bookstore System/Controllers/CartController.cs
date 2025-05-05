using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Online_Bookstore_System.Dto.CartDto;
using Online_Bookstore_System.IService;

namespace Online_Bookstore_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        public CartController(ICartService cartService) 
        {
            _cartService = cartService;
        }

        [HttpPost("AddToCart")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        public async Task<IActionResult> AddToCart( AddToCartRequestDto request)
        {
            var userIdClaim = HttpContext.User.FindFirst("userId");

            if (userIdClaim == null) return Unauthorized("User not found");

            var userId = userIdClaim?.Value;

            var response = await _cartService.AddToCartAsync(userId,request);
            return StatusCode(response.StatusCode, response);

        }

        [HttpGet("GetMyCart")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        public async Task<IActionResult> GetMyCart()
        {
            var userIdClaim = HttpContext.User.FindFirst("userId");
            if (userIdClaim == null) return Unauthorized("User not found");

            var userId = userIdClaim.Value;
            var response = await _cartService.GetUserCartAsync(userId);
            return StatusCode(response.StatusCode, response);
        }

        [HttpDelete("RemoveFromCart")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        public async Task<IActionResult> RemoveFromCart(RemoveCartItemRequestDto request)
        {
            var userIdClaim = HttpContext.User.FindFirst("userId");

            if (userIdClaim == null) return Unauthorized("User not found");

            var userId = userIdClaim.Value;

            var response = await _cartService.RemoveFromCartAsync(userId, request);
            return StatusCode(response.StatusCode, response);
        }


    }
}
