using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Online_Bookstore_System.DataSecurity;
using Online_Bookstore_System.Dto.ResponseDto;
using Online_Bookstore_System.Dto.ReviewDto;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.Service
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IDataProtector _dataProtector;
        private readonly UserManager<ApplicationUser> _userManager;

        public ReviewService(IReviewRepository reviewRepository, IDataProtectionProvider dataProtector, DataSecurityProvider securityProvider, UserManager<ApplicationUser> userManager)
        {
            _reviewRepository = reviewRepository;
            _userManager = userManager;
            _dataProtector = dataProtector.CreateProtector(securityProvider.securityKey);
        }

        public async Task<ApiResponseDto> CheckEligibilityAsync(string userId, string bookId)
        {
            try
            {
                var unprotectedId = _dataProtector.Unprotect(bookId);

                if (!long.TryParse(unprotectedId, out long BookId))
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Invalid Book ID format.",
                        StatusCode = 400
                    };
                }

                var isEligible = await _reviewRepository.CheckEligibilityAsync(userId, BookId);

                if (!isEligible)
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "You are not eligible to review this book. Please complete a purchase first.",
                        StatusCode = 403
                    };
                }

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "You are eligible to review this book.",
                    StatusCode = 200
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while checking eligibility: {ex.Message}",
                    StatusCode = 500
                };
            }
        }

        public async Task<ApiResponseDto> DoReviewAsync(DoReviewDto doReviewDto, string userId)
        {
            try
            {
                var unprotectedId = _dataProtector.Unprotect(doReviewDto.BookId);

                if (!long.TryParse(unprotectedId, out long bookId))
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Invalid Book ID format.",
                        StatusCode = 400
                    };
                }

                var review = new Review
                {
                    BookId = bookId,
                    UserId = userId,
                    Comment = doReviewDto.Comment,
                    CreatedAt = DateTime.UtcNow,
                };

                var response = await _reviewRepository.AddReview(review);

                if (!response)
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Failed to post the review.",
                        StatusCode = 500
                    };
                }

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "Review posted successfully.",
                    StatusCode = 200
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while posting the review: {ex.Message}",
                    StatusCode = 500
                };
            }
        }

        public async Task<ApiResponseDto> GetReviewAsync(string bookId)
        {
            try
            {
                var unprotectedId = _dataProtector.Unprotect(bookId);

                if (!long.TryParse(unprotectedId, out long bookIdParsed))
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Invalid Book ID format.",
                        StatusCode = 400
                    };
                }

                var reviews = await _reviewRepository.GetReviews(bookIdParsed);

                if (reviews == null || !reviews.Any())
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = true,
                        Message = "No reviews found for this book.",
                        StatusCode = 200,
                        Data = new List<GetReviewDto>()
                    };
                }

                var reviewDtos = new List<GetReviewDto>();

                foreach (var review in reviews)

                {
                    var user = await _userManager.FindByIdAsync(review.UserId);
                    reviewDtos.Add(new GetReviewDto
                    {
                        ReviewId = review.Id,
                        UserId = review.UserId,
                        FullName = user?.FullName ?? "Unknown User",
                        Comment = review.Comment,
                        CreatedTime = review.CreatedAt
                    });
                }

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "Reviews fetched successfully.",
                    StatusCode = 200,
                    Data = reviewDtos
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while fetching the reviews: {ex.Message}",
                    StatusCode = 500
                };
            }
        }

        public async Task<ApiResponseDto> RemoveReviewAsync(int reviewId)
        {
            try
            {
                var response = await _reviewRepository.DeleteReviewAsync(reviewId); 

                if (response)
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = true,
                        Message = "Review deleted successfully.",
                        StatusCode = 200
                    };
                }

                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = "Failed to delete the review.",
                    StatusCode = 400
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while deleting the review: {ex.Message}",
                    StatusCode = 500
                };
            }
        }

    }
}
