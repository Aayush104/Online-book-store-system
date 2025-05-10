using Microsoft.EntityFrameworkCore;
using Online_Bookstore_System.Data;
using Online_Bookstore_System.Dto.ReviewDto;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.Repository
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly AppDbContext _context;

        public ReviewRepository(AppDbContext context)
        {
            _context = context;
        }

    
        public async Task<bool> AddReview(Review review)
        {
            if (review == null)
                throw new ArgumentNullException(nameof(review));

            try
            {
                await _context.Reviews.AddAsync(review);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
              
                return false;
            }
        }


        public async Task<bool> CheckEligibilityAsync(string userId, long bookId)
        {
            return await _context.OrderItems.AnyAsync(x =>
                x.BookId == bookId &&
                x.Order != null &&
                x.Order.UserId == userId &&
                x.Order.Status == "Completed");
        }

        public async Task<bool> DeleteReviewAsync(int reviewId)
        {
            var review = await _context.Reviews.FirstOrDefaultAsync(x => x.Id == reviewId);

            if (review == null)
            {
                return false;
            }

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Review>> GetReviews(long bookId)
        {
            return await _context.Reviews.Where(x => x.BookId == bookId).ToListAsync();
            
        }
    }
}
