using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Online_Bookstore_System.Dto.ReviewDto;
using Online_Bookstore_System.IService;

namespace Online_Bookstore_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet("CheckEligibilityForReview/{bookId}")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        public async Task<IActionResult> CheckEligibilityForReview(string bookId)
        {
            var userIdClaim = HttpContext.User.FindFirst("userId");
            if (userIdClaim == null)
                return Unauthorized("User not found");

            var userId = userIdClaim.Value;

            var response = await _reviewService.CheckEligibilityAsync(userId, bookId);

            return StatusCode(response.StatusCode, response);
        }


        [HttpPost("DoReview")]
        [Authorize(AuthenticationSchemes = "Bearer")]
        public async Task<IActionResult> DoReview(DoReviewDto doReviewDto)
        {
            var userIdClaim = HttpContext.User.FindFirst("userId");
            if (userIdClaim == null)
                return Unauthorized("User not found");

            var userId = userIdClaim.Value;

            var response = await _reviewService.DoReviewAsync(doReviewDto, userId);

            return StatusCode(response.StatusCode, response);
        }

        [HttpGet("GetReview/{BookId}")]

        public async Task<IActionResult> GetReview(string BookId)
        {

            var response = await _reviewService.GetReviewAsync(BookId);

            return StatusCode(response.StatusCode, response);
        }

        [HttpDelete("DeleteReview/{ReviewId}")]

        public async Task<IActionResult> GetReview(int ReviewId)
        {

            var response = await _reviewService.RemoveReviewAsync(ReviewId);

            return StatusCode(response.StatusCode, response);
        }
    }
}
