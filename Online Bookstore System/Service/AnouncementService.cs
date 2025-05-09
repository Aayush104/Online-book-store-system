using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Online_Bookstore_System.Dto.AnnouncementDto;
using Online_Bookstore_System.Dto.ResponseDto;
using Online_Bookstore_System.Hubs;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.Service
{
    public class AnouncementService : IAnnouncementService
    {
        private readonly IAnnouncementReposoitory _announcementReposoitory;
        private readonly IHubContext<Notificationhub> _Context;
        public AnouncementService(IAnnouncementReposoitory announcementReposoitory, IHubContext<Notificationhub> Context)
        {
            _announcementReposoitory = announcementReposoitory;
            _Context = Context;
        }
        public async  Task<ApiResponseDto> DoAnnouncementAsync(CreateAnnouncementDto announceDto)
        {
            if (announceDto == null)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = "Invalid announcement data.",
                    StatusCode = 400
                };
            }

            var announce = new Announce
            {
                Title = announceDto.Title,
                Description = announceDto.Description,
                CreatedAt = DateTime.UtcNow
            };



            await _announcementReposoitory.DoAnnounceAsync(announce);

            return new ApiResponseDto
            {
                IsSuccess = true,
                Message = "Announcement created successfully.",
                StatusCode = 200
            };

        }
    }
}
