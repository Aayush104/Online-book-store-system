using Online_Bookstore_System.Dto.AnnouncementDto;
using Online_Bookstore_System.Dto.ResponseDto;

namespace Online_Bookstore_System.IService
{
    public interface IAnnouncementService
    {
        Task<ApiResponseDto> DoAnnouncementAsync(CreateAnnouncementDto announceDto);
    }
}
