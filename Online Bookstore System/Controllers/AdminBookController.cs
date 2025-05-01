using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Online_Bookstore_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminBookController : ControllerBase
    {
        [HttpPost]
        public IActionResult CreateBook([FromBody] BookDto book) { /* create new book */ return Ok(); }

        [HttpPut("{id}")]
        public IActionResult UpdateBook(int id, [FromBody] BookDto book) { /* update book */ return Ok(); }

        [HttpDelete("{id}")]
        public IActionResult DeleteBook(int id) { /* delete book */ return Ok(); }

        [HttpPost("{id}/inventory")]
        public IActionResult UpdateInventory(int id, [FromBody] InventoryDto inventory) { /* update stock */ return Ok(); }
    }
}
