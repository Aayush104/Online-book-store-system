using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Online_Bookstore_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnnouncementController : ControllerBase
    {
        [HttpPost]
        public IActionResult CreateAnnouncement([FromBody] AnnouncementDto announcement) { /* create timed announcement */ return Ok(); }

        [HttpDelete("{id}")]
        public IActionResult DeleteAnnouncement(int id) { /* delete announcement */ return Ok(); }

        [HttpGet]
        public IActionResult GetActiveAnnouncements() { /* list active announcements */ return Ok(); }
    }
}
