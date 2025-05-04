using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Online_Bookstore_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccessController : ControllerBase
    {
        public AccessController() { }

        [HttpGet("CheckAccess")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        public IActionResult CheckAccess()
        {
           
            var userIdClaim = HttpContext.User.FindFirst("userId");

            if (userIdClaim == null || string.IsNullOrWhiteSpace(userIdClaim.Value))
            {
                return Unauthorized(new { Message = "User ID claim not found or empty." });
            }

            return Ok(new { UserId = userIdClaim.Value });
        }
    }
}
