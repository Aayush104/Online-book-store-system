using Microsoft.AspNetCore.DataProtection;
using Online_Bookstore_System.DataSecurity;
using Online_Bookstore_System.Dto.BookDto;
using Online_Bookstore_System.Dto.Pagination;
using Online_Bookstore_System.Dto.ResponseDto;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Model;

namespace Online_Bookstore_System.Service
{
    public class BookService : IBookService
    {
        private readonly IBookRepository _bookRepository;
        private readonly IFileService _fileService;
        private readonly IDataProtector _dataProtector;


        public BookService(IBookRepository bookRepository, IFileService fileService, IDataProtectionProvider dataProtector, DataSecurityProvider securityProvider)
        {
            _bookRepository = bookRepository;
            _fileService = fileService;
            _dataProtector = dataProtector.CreateProtector(securityProvider.securityKey);
        }

        public async Task<ApiResponseDto> AddBookAsync(AddBookDto addBookDto)
        {
            try
            {
                var bookId = await _bookRepository.GetBookNumber();
                var bookPhoto = await _fileService.SaveFileAsync(addBookDto.BookPhotoFile, "BookPhotos");
                var book = new Book
                {
                    BookId = bookId,
                    Title = addBookDto.Title,
                    ISBN = addBookDto.ISBN,
                    BookPhoto = bookPhoto,
                    Description = addBookDto.Description,
                    Author = addBookDto.Author,
                    Genre = addBookDto.Genre,
                    Language = addBookDto.Language,
                    Format = addBookDto.Format,
                    Publisher = addBookDto.Publisher,
                    PublicationDate = addBookDto.PublicationDate,
                    Price = addBookDto.Price,
                    Stock = addBookDto.Stock,
                    IsAvailableInLibrary = addBookDto.IsAvailableInLibrary,
                    OnSale = addBookDto.OnSale,
                    DiscountPercentage = addBookDto.OnSale ? addBookDto.DiscountPercentage : null,
                    DiscountStartDate = addBookDto.OnSale ? addBookDto.DiscountStartDate : null,
                    DiscountEndDate = addBookDto.OnSale ? addBookDto.DiscountEndDate : null,
                    ExclusiveEdition = addBookDto.ExclusiveEdition,
                    AddedDate = DateTime.UtcNow
                };

                await _bookRepository.AddBook(book);

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "Book added successfully.",
                    StatusCode = 201,
                    Data = book
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while adding the book. {ex.Message}",
                    StatusCode = 500
                };
            }
        }

        public async Task<ApiResponseDto> GetBooksAsync(PaginationParams paginationParams)
        {
            try
            {
                if (paginationParams.PageSize <= 0 || paginationParams.Page <= 0)
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "PageSize or Page must be greater than zero.",
                        StatusCode = 400
                    };
                }

                var books = await _bookRepository.GetPaginatedBooksAsync(paginationParams);

                if (books == null || books.Items == null || !books.Items.Any())
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "No books found.",
                        StatusCode = 404
                    };
                }

               
                var protectedItems = books.Items.Select(book => new GetBookDto
                {
                    BookId = _dataProtector.Protect(book.BookId.ToString()),
                    Title = book.Title,
                    Isbn = book.ISBN,
                    Description = book.Description,
                    Author = book.Author,
                    Genre = book.Genre,
                    Language = book.Language,
                    BookPhoto = book.BookPhoto,
                    Format = book.Format,
                    Publisher = book.Publisher,
                    PublicationDate = book.PublicationDate,
                    Price = book.Price,
                    Stock = book.Stock,
                    IsAvailableInLibrary = book.IsAvailableInLibrary,
                    OnSale = book.OnSale,
                    DiscountPercentage = book.DiscountPercentage,
                    DiscountStartDate = book.DiscountStartDate,
                    DiscountEndDate = book.DiscountEndDate,
                    ExclusiveEdition = book.ExclusiveEdition,
                    AddedDate = book.AddedDate
                }).ToList();

                var protectedResult = new PagedResult<GetBookDto>
                {
                    CurrentPage = books.CurrentPage,
                    PageSize = books.PageSize,
                    TotalItems = books.TotalItems,
                    TotalPages = books.TotalPages,
                    Items = protectedItems
                };

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "Books fetched successfully.",
                    StatusCode = 200,
                    Data = protectedResult
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

        public async Task<ApiResponseDto> GetBooksByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Book ID is required.",
                        StatusCode = 400
                    };
                }

              
                string unprotectedId = _dataProtector.Unprotect(id);
                if (!int.TryParse(unprotectedId, out int bookId))
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Invalid Book ID format.",
                        StatusCode = 400
                    };
                }

            
                var book = await _bookRepository.GetBooksById(bookId);

                if (book == null)
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Book not found.",
                        StatusCode = 404
                    };
                }

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "Book fetched successfully.",
                    StatusCode = 200,
                    Data = book
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


        public async Task<ApiResponseDto> GetFilterBooksAsync(BookFilterParams bookFilterParams)
        {
            try
            {
                var filteredBooks = await _bookRepository.GetBooksAsync(bookFilterParams);

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "Books fetched successfully.",
                    StatusCode = 200,
                    Data = filteredBooks
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
