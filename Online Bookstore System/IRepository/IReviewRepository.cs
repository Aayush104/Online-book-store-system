using Online_Bookstore_System.Dto.ResponseDto;
using Online_Bookstore_System.Dto.ReviewDto;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.IRepository
{
    public interface IReviewRepository
    {
        Task<bool> CheckEligibilityAsync(string userId, long bookId);
        Task <bool>  AddReview(Review review);
        Task <bool> DeleteReviewAsync(int reviewId);
        Task <List<Review>> GetReviews(long bookId);
    }
}
