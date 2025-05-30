﻿using Microsoft.AspNetCore.DataProtection;
using Online_Bookstore_System.DataSecurity;
using Online_Bookstore_System.Dto.BookDto;
using Online_Bookstore_System.Dto.Pagination;
using Online_Bookstore_System.Dto.ResponseDto;
using Online_Bookstore_System.IRepository;
using Online_Bookstore_System.IService;
using Online_Bookstore_System.Model;
using System.Net;
using static System.Reflection.Metadata.BlobBuilder;

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


                var protectedItems = new GetBookDto
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
                };


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
                    Data = protectedItems
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

                if (filteredBooks == null || !filteredBooks.Any())
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "No books found.",
                        StatusCode = 404
                    };
                }

                var protectedBooks = filteredBooks.Select(book => new GetBookDto
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

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "Books fetched successfully.",
                    StatusCode = 200,
                    Data = protectedBooks
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

        public async Task<ApiResponseDto> UpdateBookAsync(string id, UpdateBookDto updateBookDto)
        {
            try
            {
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

                var existingBook = await _bookRepository.GetBooksById(bookId);
                if (existingBook == null)
                {
                    return new ApiResponseDto
                    {
                        IsSuccess = false,
                        Message = "Book not found.",
                        StatusCode = 404
                    };
                }

                // Optional: Update image if a new one is uploaded
                if (updateBookDto.BookPhotoFile != null)
                {
                    existingBook.BookPhoto = await _fileService.SaveFileAsync(updateBookDto.BookPhotoFile, "BookPhotos");
                }

                // Update book fields
                existingBook.Title = updateBookDto.Title;
                existingBook.ISBN = updateBookDto.ISBN;
                existingBook.Description = updateBookDto.Description;
                existingBook.Author = updateBookDto.Author;
                existingBook.Genre = updateBookDto.Genre;
                existingBook.Language = updateBookDto.Language;
                existingBook.Format = updateBookDto.Format;
                existingBook.Publisher = updateBookDto.Publisher;
                existingBook.PublicationDate = updateBookDto.PublicationDate;
                existingBook.Price = updateBookDto.Price;
                existingBook.Stock = updateBookDto.Stock;
                existingBook.IsAvailableInLibrary = updateBookDto.IsAvailableInLibrary;
                existingBook.OnSale = updateBookDto.OnSale;
                existingBook.DiscountPercentage = updateBookDto.OnSale ? updateBookDto.DiscountPercentage : null;
                existingBook.DiscountStartDate = updateBookDto.OnSale ? updateBookDto.DiscountStartDate : null;
                existingBook.DiscountEndDate = updateBookDto.OnSale ? updateBookDto.DiscountEndDate : null;
                existingBook.ExclusiveEdition = updateBookDto.ExclusiveEdition;

                await _bookRepository.UpdateBook(existingBook);

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "Book updated successfully.",
                    StatusCode = 200,
                    Data = existingBook
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while updating the book. {ex.Message}",
                    StatusCode = 500
                };
            }
        }

        public async Task<ApiResponseDto> DeleteBookAsync(string id)
        {
            try
            {
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

                await _bookRepository.DeleteBook(book);

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "Book deleted successfully.",
                    StatusCode = 200
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while deleting the book. {ex.Message}",
                    StatusCode = 500
                };
            }
        }

        public async Task<ApiResponseDto> GetNewReleasesBooksAsync()
        {
            try
            {
                var books = await _bookRepository.GetNewReleaseBooks();

                var protectedBooks = books.Select(book => new GetBookDto
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

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "New release books fetched successfully.",
                    StatusCode = 200,
                    Data = protectedBooks
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while fetching new release books. {ex.Message}",
                    StatusCode = 500
                };
            }
        }

        public async  Task<ApiResponseDto> BestSellersBooksAsync()
        {
            try
            {
                var books = await _bookRepository.GetBestSellersBooks();

                var protectedBooks = books.Select(book => new GetBookDto
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

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "New release books fetched successfully.",
                    StatusCode = 200,
                    Data = protectedBooks
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while fetching new release books. {ex.Message}",
                    StatusCode = 500
                };
            }
        }

        public async Task<ApiResponseDto> SpecialDealsBookAsync()
        {
            try
            {
                var books = await _bookRepository.SpecialDealsBookAsync();

                var protectedBooks = books.Select(book => new GetBookDto
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

                return new ApiResponseDto
                {
                    IsSuccess = true,
                    Message = "New release books fetched successfully.",
                    StatusCode = 200,
                    Data = protectedBooks
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while fetching new release books. {ex.Message}",
                    StatusCode = 500
                };
            }
        }
    }
}
