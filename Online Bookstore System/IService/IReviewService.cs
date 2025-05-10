using Online_Bookstore_System.Dto.ResponseDto;
using Online_Bookstore_System.Dto.ReviewDto;

namespace Online_Bookstore_System.IService
{
    public interface IReviewService
    {
        Task<ApiResponseDto> CheckEligibilityAsync(string userId, string bookId);
        Task<ApiResponseDto> DoReviewAsync(DoReviewDto doReviewDto, string userId);
        Task<ApiResponseDto> GetReviewAsync(string bookId );
        Task<ApiResponseDto> RemoveReviewAsync(int reviewId );
    }
}
