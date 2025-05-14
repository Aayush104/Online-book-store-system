using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Online_Bookstore_System.Dto.AnnouncementDto;
using Online_Bookstore_System.Dto.Pagination;
using Online_Bookstore_System.IService;

namespace Online_Bookstore_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnnouncementController : ControllerBase
    {
        private readonly IAnnouncementService _announcementService;
        public AnnouncementController(IAnnouncementService announcementService)
        {
            _announcementService = announcementService;
        }

        [HttpPost ("SetAnnouncement")]
        public async Task <IActionResult> CreateAnnouncement(CreateAnnouncementDto announcement)
        {
            var response = await _announcementService.DoAnnouncementAsync(announcement);

            return StatusCode(response.StatusCode, response);

        }

        [HttpGet("active-announcements")]
        public async Task<IActionResult> GetActiveAnnouncements()
        {
            var response = await _announcementService.GetActiveAnnouncementsAsync();

            return StatusCode(response.StatusCode, response);

        }



    }
}
