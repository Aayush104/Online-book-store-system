using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Online_Bookstore_System.Dto.BookDto;
using Online_Bookstore_System.IService;
using System.Security.Claims;

namespace Online_Bookstore_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WishlistController : ControllerBase
    {

        private readonly IWhiteListService _whiteListService;
        public WishlistController(IWhiteListService whiteListService)
        {
            _whiteListService = whiteListService;
        }

        [HttpPost("AddToBookMark/{bookId}")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        public async Task<IActionResult> AddToWishlist(string bookId)
        {
            var userIdClaim = HttpContext.User.FindFirst("userId");

            if (userIdClaim == null) return Unauthorized("User not found");

            var userId = userIdClaim?.Value;


            var response = await _whiteListService.AddWhiteListAsync(bookId, userId);
            return StatusCode(response.StatusCode, response);

        }


        [HttpGet("GetBookMark")]
        [Authorize(AuthenticationSchemes = "Bearer")]

        public async Task<IActionResult> GetWishlist()
        {
            var userIdClaim = HttpContext.User.FindFirst("userId");

            if (userIdClaim == null) return Unauthorized("User not found");

            var userId = userIdClaim?.Value;

            var response = await _whiteListService.GetWhiteListAsync(userId);
            return StatusCode(response.StatusCode, response);
        }
    }
}

