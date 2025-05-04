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

        public async Task<IActionResult> GetBooksById([FromQuery] BookFilterParams filterParams)
        {
            var response = await _bookService.GetFilterBooksAsync(filterParams);

            return StatusCode(response.StatusCode, response);
        }


        //// GET: api/Book/categories
        //[HttpGet("categories")]
        //public IActionResult GetBookCategories()
        //{
        //    // Logic to return category-wise groupings like Bestsellers, Award Winners, etc.
        //    return Ok(new { message = "Book categories tabs returned." });
        //}

        //// GET: api/Book/search?query=searchText
        //[HttpGet("search")]
        //public IActionResult SearchBooks([FromQuery] string query)
        //{
        //    // Logic to search books by title, ISBN, or description
        //    return Ok(new { message = $"Books matching search: {query}." });
        //}

        //// GET: api/Book/filters
        //[HttpGet("filters")]
        //public IActionResult GetFilterOptions()
        //{
        //    // Logic to return available filters (authors, genres, publishers, languages, etc.)
        //    return Ok(new { message = "Filter options returned." });
        //}
    }
}
