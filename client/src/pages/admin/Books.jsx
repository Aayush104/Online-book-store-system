import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  EyeIcon,
  TrashIcon,
  AdjustmentsHorizontalIcon,
  ListBulletIcon,
  Squares2X2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import AddBookModal from "../../components/AddBookModal";
import BookDetailsModal from "../../components/BookDetailsModal";
import AdminBookService from "../../services/AdminBookService";
import { useToast } from "../../components/Toast";

const Books = () => {
  // State hooks
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookToEdit, setBookToEdit] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const { showToast } = useToast();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [filters, setFilters] = useState({
    genre: "",
    author: "",
    publisher: "",
    language: "",
    format: "",
    inStock: null,
    onSale: null,
    minPrice: "",
    maxPrice: "",
  });

  // Fetch books on component mount and pagination/filter changes
  useEffect(() => {
    fetchBooks();
  }, [currentPage, pageSize, filters, searchQuery]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      // Prepare query parameters
      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
        search: searchQuery || undefined,
      };

      // Add filters if they have values
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== "" && filters[key] !== null) {
          params[key] = filters[key];
        }
      });

      // Call the API
      let response;
      if (
        searchQuery ||
        Object.values(filters).some((v) => v !== "" && v !== null)
      ) {
        response = await AdminBookService.searchFilterBooks(params);
      } else {
        response = await AdminBookService.getAllBooks(params);
      }

      if (response.isSuccess) {
        setBooks(response.data.items || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.totalCount || 0);

        // Only show toast for non-success responses and not on initial load
        if (
          !initialLoad &&
          !response.data?.items?.length &&
          (searchQuery ||
            Object.values(filters).some((v) => v !== "" && v !== null))
        ) {
          showToast("info", "No books found matching your criteria.");
        }
      } else {
        // Only show error toast if not on initial load
        if (!initialLoad) {
          showToast("error", response.message || "Failed to fetch books");
        }
      }

      // Set initialLoad to false after first fetch
      if (initialLoad) {
        setInitialLoad(false);
      }
    } catch (err) {
      // Only show error toast if not on initial load
      if (!initialLoad) {
        showToast(
          "error",
          err.message || "An error occurred while fetching books"
        );
      }
      setInitialLoad(false);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (bookId) => {
    try {
      setLoading(true);
      const response = await AdminBookService.getBookById(bookId);
      if (response.isSuccess) {
        setSelectedBook(response.data);
        setIsDetailsModalOpen(true);
      } else {
        showToast("error", response.message || "Failed to fetch book details");
      }
    } catch (err) {
      showToast(
        "error",
        err.message || "An error occurred while fetching book details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditBook = async (bookId) => {
    try {
      setLoading(true);
      const response = await AdminBookService.getBookById(bookId);
      console.log(response);
      if (response.isSuccess) {
        setBookToEdit(response.data);
        setIsAddModalOpen(true);
      } else {
        showToast(
          "error",
          response.message || "Failed to fetch book details for editing"
        );
      }
    } catch (err) {
      showToast(
        "error",
        err.message || "An error occurred while preparing to edit the book"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        setLoading(true);
        const response = await AdminBookService.deleteBook(bookId);
        if (response.isSuccess) {
          // Refresh the book list
          fetchBooks();
          showToast("success", "Book deleted successfully");
        } else {
          showToast("error", response.message || "Failed to delete book");
        }
      } catch (err) {
        showToast(
          "error",
          err.message || "An error occurred while deleting the book"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFilters({ ...filters, [name]: checked ? true : null });
    } else {
      setFilters({ ...filters, [name]: value });
    }
    // Reset to page 1 when filters change
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      genre: "",
      author: "",
      publisher: "",
      language: "",
      format: "",
      inStock: null,
      onSale: null,
      minPrice: "",
      maxPrice: "",
    });
    setSearchQuery("");
    setCurrentPage(1);
    showToast("info", "Filters cleared");
  };

  // Handle pagination
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  // Utility functions for displaying book data
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  };

  const displayPrice = (book) => {
    const hasDiscount = book.onSale && book.discountPercentage > 0;
    if (!hasDiscount) return `$${book.price.toFixed(2)}`;

    const discountAmount = (book.price * book.discountPercentage) / 100;
    const discountedPrice = book.price - discountAmount;

    return (
      <div>
        <span className="font-bold">${discountedPrice.toFixed(2)}</span>
        <span className="line-through text-neutral-500 ml-2 dark:text-neutral-400">
          ${book.price.toFixed(2)}
        </span>
      </div>
    );
  };

  const handleAddBook = () => {
    setBookToEdit(null); // Ensure we're not in edit mode
    setIsAddModalOpen(true);
  };

  const handleBookActionCompleted = (success) => {
    setIsAddModalOpen(false);
    setBookToEdit(null); // Reset edit state

    // Refresh book list if operation was successful
    if (success) {
      fetchBooks();
      showToast(
        "success",
        bookToEdit ? "Book updated successfully!" : "Book added successfully!"
      );
    }
  };

  const renderStatusBadge = (
    isInStock,
    isOnSale,
    discountPercentage,
    viewType = "table"
  ) => {
    const gridBadgeClasses =
      "px-3 py-1.5 text-xs font-bold rounded-full shadow-sm flex items-center justify-center gap-1.5";
    const tableBadgeClasses =
      "px-2.5 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-sm";

    return (
      <div className="flex flex-col space-y-2">
        {isInStock ? (
          <span
            className={`${
              viewType === "grid" ? gridBadgeClasses : tableBadgeClasses
            } bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-50 border border-green-200 dark:border-green-600 w-fit`}
          >
            <CheckIcon className="h-3.5 w-3.5" />
            <span>In Stock</span>
          </span>
        ) : (
          <span
            className={`${
              viewType === "grid" ? gridBadgeClasses : tableBadgeClasses
            } bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-50 border border-red-200 dark:border-red-600 w-fit`}
          >
            <XMarkIcon className="h-3.5 w-3.5" />
            <span>Out of Stock</span>
          </span>
        )}

        {isOnSale && (
          <span
            className={`${
              viewType === "grid" ? gridBadgeClasses : tableBadgeClasses
            } bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-amber-50 border border-amber-200 dark:border-amber-600 w-fit`}
          >
            <span className="font-bold">{discountPercentage}% </span>
            <span>OFF</span>
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900 dark:text-neutral-100">
            Books Management
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Manage your bookstore inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              aria-label="Toggle filters"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 ${
                viewMode === "table"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
              aria-label="Table view"
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
              aria-label="Grid view"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleAddBook}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-600 dark:hover:bg-primary-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" /> Add Book
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white dark:bg-neutral-800 rounded-lg shadow border border-neutral-200 dark:border-neutral-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Genre
              </label>
              <input
                type="text"
                name="genre"
                value={filters.genre}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100"
                placeholder="Filter by genre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Author
              </label>
              <input
                type="text"
                name="author"
                value={filters.author}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100"
                placeholder="Filter by author"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Publisher
              </label>
              <input
                type="text"
                name="publisher"
                value={filters.publisher}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100"
                placeholder="Filter by publisher"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Language
              </label>
              <input
                type="text"
                name="language"
                value={filters.language}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100"
                placeholder="Filter by language"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Format
              </label>
              <select
                name="format"
                value={filters.format}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100"
              >
                <option value="">All Formats</option>
                <option value="Paperback">Paperback</option>
                <option value="Hardcover">Hardcover</option>
                <option value="Signed">Signed Edition</option>
                <option value="Limited">Limited Edition</option>
                <option value="First">First Edition</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Price Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100"
                  placeholder="Min"
                  min="0"
                />
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100"
                  placeholder="Max"
                  min="0"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="inStock"
                  id="inStock"
                  checked={filters.inStock === true}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded dark:border-neutral-600"
                />
                <label
                  htmlFor="inStock"
                  className="ml-2 text-sm text-neutral-700 dark:text-neutral-300"
                >
                  In Stock Only
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="onSale"
                  id="onSale"
                  checked={filters.onSale === true}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded dark:border-neutral-600"
                />
                <label
                  htmlFor="onSale"
                  className="ml-2 text-sm text-neutral-700 dark:text-neutral-300"
                >
                  On Sale Only
                </label>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-md hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        )}

        {/* No Books State */}
        {!loading && books.length === 0 && (
          <div className="p-8 text-center">
            <BookOpenIcon className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500 mb-4" />
            <p className="text-neutral-600 dark:text-neutral-300 mb-4">
              {searchQuery ||
              Object.values(filters).some((v) => v !== "" && v !== null)
                ? "No books found. Try adjusting your search or filters."
                : "No books found. Add your first book to get started!"}
            </p>
            <button
              onClick={handleAddBook}
              className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Add Your First Book
            </button>
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && !loading && books.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                  >
                    Book
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                  >
                    Author
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                  >
                    Genre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                  >
                    Stock
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200 dark:bg-neutral-800 dark:divide-neutral-700">
                {books.map((book) => (
                  <tr
                    key={book.bookId}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-8 flex-shrink-0 mr-4">
                          {book.bookPhoto ? (
                            <img
                              src={book.bookPhoto}
                              alt={book.title}
                              className="h-10 w-8 object-cover rounded"
                            />
                          ) : (
                            <div className="h-10 w-8 bg-neutral-200 dark:bg-neutral-600 rounded flex items-center justify-center">
                              <BookOpenIcon className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                            </div>
                          )}
                        </div>
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {book.title}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                            ISBN: {book.isbn}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900 dark:text-neutral-100">
                        {book.author}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900 dark:text-neutral-100">
                        {book.genre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900 dark:text-neutral-100">
                        {displayPrice(book)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900 dark:text-neutral-100">
                        {book.stock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(
                        book.stock > 0,
                        book.onSale,
                        book.discountPercentage,
                        "table"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => handleViewDetails(book.bookId)}
                          className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 bg-white/0 hover:bg-green-50 dark:hover:bg-green-950/30 p-1.5 rounded-full transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditBook(book.bookId)}
                          className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 bg-white/0 hover:bg-green-50 dark:hover:bg-green-950/30 p-1.5 rounded-full transition-colors"
                          title="Edit Book"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.bookId)}
                          className="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 bg-white/0 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-full transition-colors"
                          title="Delete Book"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && !loading && books.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
            {books.map((book) => (
              <div
                key={book.bookId}
                className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden border border-neutral-200 dark:border-neutral-700 flex flex-col transition-transform hover:transform hover:scale-[1.02]"
              >
                <div className="h-56 bg-neutral-200 dark:bg-neutral-700 relative">
                  {book.bookPhoto ? (
                    <img
                      src={book.bookPhoto}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpenIcon className="h-16 w-16 text-neutral-400 dark:text-neutral-500" />
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="absolute top-2 right-2 flex flex-col space-y-1">
                    {renderStatusBadge(
                      book.stock > 0,
                      book.onSale,
                      book.discountPercentage,
                      "grid"
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3
                    className="text-lg font-medium text-neutral-900 dark:text-neutral-100 truncate"
                    title={book.title}
                  >
                    {book.title}
                  </h3>
                  <p
                    className="text-sm text-neutral-600 dark:text-neutral-400 truncate"
                    title={book.author}
                  >
                    by {book.author}
                  </p>
                  <div className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                    {book.genre} • {book.language}
                  </div>

                  <div className="mt-4 mb-2 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {displayPrice(book)}
                  </div>

                  <div className="mt-auto pt-4 flex justify-between items-center border-t border-neutral-200 dark:border-neutral-700">
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      Stock: {book.stock}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(book.bookId)}
                        className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 bg-white dark:bg-neutral-700 hover:bg-green-50 dark:hover:bg-green-950/30 p-1.5 rounded-full shadow-sm transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditBook(book.bookId)}
                        className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 bg-white dark:bg-neutral-700 hover:bg-green-50 dark:hover:bg-green-950/30 p-1.5 rounded-full shadow-sm transition-colors"
                        title="Edit Book"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.bookId)}
                        className="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 bg-white dark:bg-neutral-700 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-full shadow-sm transition-colors"
                        title="Delete Book"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && books.length > 0 && totalPages > 1 && (
          <div className="border-t border-neutral-200 dark:border-neutral-700 px-4 py-3 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? "bg-neutral-100 text-neutral-400 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-600 dark:border-neutral-700"
                    : "bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? "bg-neutral-100 text-neutral-400 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-600 dark:border-neutral-700"
                    : "bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700"
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, totalItems)}
                  </span>{" "}
                  of <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-sm border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100"
                  >
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>
                </div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 ${
                      currentPage === 1
                        ? "bg-neutral-100 text-neutral-400 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-600 dark:border-neutral-700"
                        : "bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700"
                    }`}
                  >
                    <span className="sr-only">First Page</span>
                    <span className="text-xs">First</span>
                  </button>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 border border-neutral-300 ${
                      currentPage === 1
                        ? "bg-neutral-100 text-neutral-400 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-600 dark:border-neutral-700"
                        : "bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? "z-10 bg-primary-600 text-white border-primary-600 dark:bg-primary-600"
                          : "bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 border border-neutral-300 ${
                      currentPage === totalPages
                        ? "bg-neutral-100 text-neutral-400 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-600 dark:border-neutral-700"
                        : "bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700"
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 ${
                      currentPage === totalPages
                        ? "bg-neutral-100 text-neutral-400 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-600 dark:border-neutral-700"
                        : "bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700"
                    }`}
                  >
                    <span className="sr-only">Last Page</span>
                    <span className="text-xs">Last</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Book Modal */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={handleBookActionCompleted}
        bookToEdit={bookToEdit}
      />

      {/* Book Details Modal */}
      <BookDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        book={selectedBook}
        onAddToCart={() => {}}
        onAddToWishlist={() => {}}
      />
    </div>
  );
};

export default Books;
