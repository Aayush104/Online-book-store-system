using Microsoft.AspNetCore.DataProtection;
using Online_Bookstore_System.DataSecurity;
using Online_Bookstore_System.Dto.BookDto;
using Online_Bookstore_System.Dto.ResponseDto;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.IService;

namespace Online_Bookstore_System.Service
{
    public class WhiteListService : IWhiteListService
    {
        private readonly IDataProtector _dataProtector;
        private readonly IWhiteListRepository _whiteListRepository;

        public WhiteListService(IDataProtectionProvider dataProtector, DataSecurityProvider securityProvider, IWhiteListRepository whiteListRepository)
        {
            _dataProtector = dataProtector.CreateProtector(securityProvider.securityKey);
            _whiteListRepository = whiteListRepository;
        }

        public async Task<ApiResponseDto> AddWhiteListAsync(string BookId, string userId)
        {
            try
            {
                
                var decryptedBookId = _dataProtector.Unprotect(BookId);

                if (!long.TryParse(decryptedBookId, out long convertedBookId))
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Invalid Book ID format.",
                        StatusCode = 400
                    };
                }

                await _whiteListRepository.AddWhiteListAsync(userId, convertedBookId);

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "Bookmark added successfully.",
                    StatusCode = 201
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

        public async Task<ApiResponseDto> GetWhiteListAsync(string userId)
        {
            try
            {
                var bookmarks = await _whiteListRepository.GetBookmarksAsync(userId);

                if (bookmarks == null || !bookmarks.Any())
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "No bookmarks found.",
                        StatusCode = 404
                    };
                }

                var result = bookmarks.Select(b => new
                {
                    b.Id,
                    b.BookId,
                    b.BookmarkedOn,
                    BookTitle = b.Book?.Title,
                    BookAuthor = b.Book?.Author,
                    ISBN = b.Book?.ISBN,
                    BookPhoto = b.Book?.BookPhoto,
                    Description = b.Book?.Description,
                    Genre = b.Book?.Genre,
                    Language = b.Book?.Language,
                    PublicationDate = b.Book?.PublicationDate,
                    Price = b.Book?.Price,
                    Stock = b.Book?.Stock
                }).ToList();

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "Bookmarks retrieved successfully.",
                    StatusCode = 200,
                    Data = result
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

        public async Task<ApiResponseDto> RemoveWhiteListAsync(string BookId, string userId)
        {
            try
            {
                var decryptedBookId = _dataProtector.Unprotect(BookId);

                if (!long.TryParse(decryptedBookId, out long convertedBookId))
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Invalid Book ID format.",
                        StatusCode = 400
                    };
                }

                var result = await _whiteListRepository.RemoveBookmarkAsync(userId, convertedBookId);

                if (!result)
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Bookmark not found.",
                        StatusCode = 404
                    };
                }

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "Bookmark removed successfully.",
                    StatusCode = 200
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
