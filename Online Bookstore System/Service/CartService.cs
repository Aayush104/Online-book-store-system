using Microsoft.AspNetCore.DataProtection;
using Online_Bookstore_System.DataSecurity;
using Online_Bookstore_System.Dto.CartDto;
using Online_Bookstore_System.Dto.ResponseDto;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.Service
{
    public class CartService : ICartService
    {
        private readonly IDataProtector _dataProtector;
        private readonly ICartRepository _cartRepository;

        public CartService(ICartRepository cartRepository, IDataProtectionProvider dataProtector, DataSecurityProvider securityProvider)
        {
            _cartRepository = cartRepository;
            _dataProtector = dataProtector.CreateProtector(securityProvider.securityKey);
        }

        public async Task<ApiResponseDto> AddToCartAsync(string memberId, AddToCartRequestDto request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.BookId))
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Book ID is required.",
                        StatusCode = 400
                    };
                }

                string decryptedBookId;
                try
                {
                    decryptedBookId = _dataProtector.Unprotect(request.BookId);
                }
                catch
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Invalid or tampered Book ID. Unable to process the request.",
                        StatusCode = 400
                    };
                }

                if (!long.TryParse(decryptedBookId, out long convertedBookId))
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Invalid Book ID format.",
                        StatusCode = 400
                    };
                }

                var existingItem = await _cartRepository.GetCartItemAsync(memberId, convertedBookId);

                if (existingItem != null)
                {
                    existingItem.Quantity += request.Quantity;
                    await _cartRepository.UpdateCartItemAsync(existingItem);

                    return new ApiResponseDto
                    {
                        IsSuccess = true,
                        Message = "Quantity updated successfully for the book in your cart.",
                        StatusCode = 200
                    };
                }
                else
                {
                    var newItem = new Cart
                    {
                        UserId = memberId,
                        BookId = convertedBookId,
                        Quantity = request.Quantity,
                        AddedDate = DateTime.UtcNow
                    };

                    await _cartRepository.AddCartItemAsync(newItem);

                    return new ApiResponseDto
                    {
                        IsSuccess = true,
                        Message = "Book successfully added to your cart.",
                        StatusCode = 201
                    };
                }
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = "An unexpected error occurred while adding the book to your cart.",
                    StatusCode = 500,
                    Data = ex.Message 
                };
            }
        }

        public async Task<ApiResponseDto> GetUserCartAsync(string memberId)
        {
            try
            {
                var cartItems = await _cartRepository.GetCartItemsByUserIdAsync(memberId);

                var result = cartItems.Select(item => new CartItemResponseDto
                {
                    BookId = _dataProtector.Protect(item.BookId.ToString()),
                    Title = item.Book.Title,
                    Author = item.Book.Author,
                    ImageUrl = item.Book.BookPhoto,
                    Price = item.Book.Price,
                    Quantity = item.Quantity,
                    AddedDate = item.AddedDate
                }).ToList();

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "Cart items fetched successfully",
                    StatusCode = 200,
                    Data = result
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = "An error occurred while retrieving the cart.",
                    StatusCode = 500,
                    Data = ex.Message
                };
            }
        }

        public async Task<ApiResponseDto> RemoveFromCartAsync(string memberId, RemoveCartItemRequestDto request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.BookId))
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Book ID is required.",
                        StatusCode = 400
                    };
                }

                string decryptedBookId;
                try
                {
                    decryptedBookId = _dataProtector.Unprotect(request.BookId);
                }
                catch
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Invalid or tampered Book ID.",
                        StatusCode = 400
                    };
                }

                if (!long.TryParse(decryptedBookId, out long convertedBookId))
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Invalid Book ID format.",
                        StatusCode = 400
                    };
                }

                var existingItem = await _cartRepository.GetCartItemAsync(memberId, convertedBookId);

                if (existingItem == null)
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Cart item not found.",
                        StatusCode = 404
                    };
                }

                await _cartRepository.RemoveCartItemAsync(existingItem);

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "Book successfully removed from your cart.",
                    StatusCode = 200
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = "An error occurred while removing the book from your cart.",
                    StatusCode = 500,
                    Data = ex.Message
                };
            }
        }

    }
}
