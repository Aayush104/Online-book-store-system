using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Online_Bookstore_System.Dto.AuthDto;
using Online_Bookstore_System.Dto.Pagination;
using Online_Bookstore_System.IService;

namespace Online_Bookstore_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {

        private readonly IBookService _bookService; 
        public BookController(IBookService bookService)
        {
            _bookService = bookService;
        }

        [HttpGet("PaginatedBooks")]
        public async Task <IActionResult> GetBooks([FromQuery] PaginationParams paginationParams)
        {
            var response = await _bookService.GetBooksAsync(paginationParams);

            return StatusCode(response.StatusCode, response);

        }

        [HttpGet("GetBookById/{id}")]

       public async Task<IActionResult> GetBooksById(string id)
        {
            var response = await _bookService.GetBooksByIdAsync(id);

            return StatusCode(response.StatusCode, response);
        }



        [HttpGet("SearchFilterBooks")]

        public async Task<IActionResult> SearchFilterBooks([FromQuery] BookFilterParams filterParams)
        {
            var response = await _bookService.GetFilterBooksAsync(filterParams);

            return StatusCode(response.StatusCode, response);
        }


        [HttpGet("NewReleases")]

        public async Task<IActionResult> GetNewReleasesBooks()
        {
            var response = await _bookService.GetNewReleasesBooksAsync();

            return StatusCode(response.StatusCode, response);
        }


        [HttpGet("BestSellers")]

        public async Task<IActionResult> BestSellersBook()
        {
            var response = await _bookService.BestSellersBooksAsync();

            return StatusCode(response.StatusCode, response);
        }


        [HttpGet("SpecialDeals")]

        public async Task<IActionResult> SpecialDealsBook()
        {
            var response = await _bookService.SpecialDealsBookAsync();

            return StatusCode(response.StatusCode, response);
        }
    }
}
