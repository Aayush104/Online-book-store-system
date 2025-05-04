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

        public BookService(IBookRepository bookRepository, IFileService fileService)
        {
            _bookRepository = bookRepository;
            _fileService = fileService;
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

                if (books == null)
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "No books found.",
                        StatusCode = 404
                    };
                }

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "Books fetched successfully.",
                    StatusCode = 200, 
                    Data = books
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
