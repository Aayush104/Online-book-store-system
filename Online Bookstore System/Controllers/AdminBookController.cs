using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
        public AdminBookController(IBookService bookService)
        {
            _bookService = bookService;
        }


        [HttpPost("AddBook")]

        public async Task<IActionResult> AddBook(AddBookDto addBookDto)
        {
            var response = await _bookService.AddBookAsync(addBookDto);
            return StatusCode(response.StatusCode, response);

        }

    }
}
