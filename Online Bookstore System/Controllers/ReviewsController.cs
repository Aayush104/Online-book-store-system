using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Online_Bookstore_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
   
        public class ReviewsController : ControllerBase
        {
            [HttpGet("book/{bookId}")]
            public IActionResult GetReviewsForBook(int bookId) { /* get all reviews */ return Ok(); }

            [HttpPost]
            public IActionResult AddReview([FromBody] ReviewDto review) { /* add review if user purchased */ return Ok(); }

            [HttpPut("{id}")]
            public IActionResult EditReview(int id, [FromBody] ReviewDto review) { /* edit review */ return Ok(); }

            [HttpDelete("{id}")]
            public IActionResult DeleteReview(int id) { /* delete review */ return Ok(); }
        }
    }
