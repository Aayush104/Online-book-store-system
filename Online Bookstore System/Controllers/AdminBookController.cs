using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Online_Bookstore_System.Data;
using Online_Bookstore_System.Dto.AuthDto;
using Online_Bookstore_System.Dto.BookDto;
using Online_Bookstore_System.IService;

namespace Online_Bookstore_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminBookController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly AppDbContext _context;
        public AdminBookController(IBookService bookService, AppDbContext context)
        {
            _bookService = bookService;
            _context = context;
        }


        [HttpPost("AddBook")]

        public async Task<IActionResult> AddBook(AddBookDto addBookDto)
        {
            var response = await _bookService.AddBookAsync(addBookDto);
            return StatusCode(response.StatusCode, response);

        }

        [HttpPut("UpdateBook/{id}")]
        public async Task<IActionResult> UpdateBook(string id, [FromForm] UpdateBookDto updateBookDto)
        {
            var response = await _bookService.UpdateBookAsync(id, updateBookDto);
            return StatusCode(response.StatusCode, response);
        }

        [HttpDelete("DeleteBook/{id}")]
        public async Task<IActionResult> DeleteBook(string id)
        {
            var response = await _bookService.DeleteBookAsync(id);
            return StatusCode(response.StatusCode, response);
        }
        [HttpGet("CartsAndWishlistCount")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        public async Task<IActionResult> CartsAndWishlistCount()
        {
            var userIdClaim = HttpContext.User.FindFirst("userId");

            if (userIdClaim == null)
                return Unauthorized("User not found");

            var userId = userIdClaim.Value;

            var numberOfCarts = await _context.Carts
                .Where(c => c.UserId == userId)
                .CountAsync();

            var numberOfWishlist = await _context.BookMarks
                .Where(b => b.UserId == userId)
                .CountAsync();

            return Ok(new
            {
                CartCount = numberOfCarts,
                WishlistCount = numberOfWishlist
            });
        }

        [HttpGet("AdminDashboardStats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var totalBooks = await _context.Books.CountAsync();
                var totalOrders = await _context.Orders.CountAsync();

                // Get all roles
                var userRoles = await _context.UserRoles.ToListAsync();
                var roles = await _context.Roles.ToListAsync();
                var users = await _context.Users.ToListAsync();

                var staffRoleIds = roles
                    .Where(r => r.Name == "Staff")
                    .Select(r => r.Id)
                    .ToList();

                var publicUserRoleIds = roles
                    .Where(r => r.Name == "PublicUser")
                    .Select(r => r.Id)
                    .ToList();

                var totalStaff = userRoles.Count(ur => staffRoleIds.Contains(ur.RoleId));
                var totalPublicUsers = userRoles.Count(ur => publicUserRoleIds.Contains(ur.RoleId));

                return Ok(new
                {
                    TotalBooks = totalBooks,
                    TotalOrders = totalOrders,
                    TotalStaff = totalStaff,
                    TotalPublicUsers = totalPublicUsers
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"An error occurred: {ex.Message}" });

            }

        }
    }
}
