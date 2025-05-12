using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Online_Bookstore_System.Dto.AnnouncementDto;
using Online_Bookstore_System.Dto.ResponseDto;
using Online_Bookstore_System.Hubs;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Model;
using Online_Bookstore_System.Repository;

namespace Online_Bookstore_System.Service
{
    public class AnouncementService : IAnnouncementService
    {
        private readonly IAnnouncementReposoitory _announcementReposoitory;
      
        public AnouncementService(IAnnouncementReposoitory announcementReposoitory, IHubContext<Notificationhub> Context)
        {
            _announcementReposoitory = announcementReposoitory;
            
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
                AnnouncemnetDateTime = announceDto.AnnouncementDateTime,
                AnnouncemnetEndDateTime = announceDto.AnnouncementEndDateTime,

            };

           

            await _announcementReposoitory.DoAnnounceAsync(announce);

            return new ApiResponseDto
            {
                IsSuccess = true,
                Message = "Announcement created successfully.",
                StatusCode = 200
            };

        }

        public async Task<ApiResponseDto> GetActiveAnnouncementsAsync()
        {
            try
            {
                var activeAnnouncements = await _announcementReposoitory.GetActiveAnnouncementsAsync();

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "Fetched active announcements successfully.",
                    StatusCode = 200,
                    Data = activeAnnouncements 
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred: {ex.Message}",
                    StatusCode = 500
                };
            }
        }
    }
}
