import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BookService from "../../services/BooksServices";
import CartService from "../../services/CartService";
import WishlistService from "../../services/WishlistService";
import { Heart, Star } from "lucide-react";
import { useToast } from "../../components/Toast";

const HomePage = () => {
  const { showToast } = useToast();

  // State for user
  const [userId, setUserId] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]); // To track bookmarked items

  // State for books and pagination
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(2);
  const [pageSize, setPageSize] = useState(5);

  // Active tab state
  const [activeTab, setActiveTab] = useState("today"); // 'today', 'thisWeek', 'thisMonth'

  // State for filters
  const [filters, setFilters] = useState({
    Title: "",
    Author: "",
    Genre: "",
    Format: "",
    Publisher: "",
    Language: "",
    MinPrice: "",
    MaxPrice: "",
    IsAvailableInLibrary: false,
    InStock: false,
    OnSale: false,
    ExclusiveEdition: "",
    SortBy: "Price",
    SortOrder: "asc",
  });

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    genres: [],
    formats: [],
    publishers: [],
    languages: [],
    exclusiveEditions: [
      "Signed",
      "Limited Edition",
      "First Edition",
      "Collector's Edition",
      "Author's Edition",
      "Deluxe Edition",
    ],
  });

  // Extract user ID from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payload));
        const extractedUserId =
          decodedPayload.UserId || decodedPayload.userId || decodedPayload.sub;
        setUserId(extractedUserId);
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
  }, []);

  // Fetch wishlist items if user is logged in
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userId) return;

      try {
        const response = await WishlistService.getMyWishlist();
        if (response.isSuccess && response.data) {
          // Store wishlist items for checking later
          setWishlistItems(response.data.map((item) => item.bookId));
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        // Don't show an error toast as this is a background fetch
      }
    };

    fetchWishlist();
  }, [userId]);

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch initial set of books to extract filter options
        const response = await BookService.getBooks({
          PageNumber: 1,
          PageSize: 100,
        });

        if (response && response.isSuccess && response.data) {
          const books = response.data.items || [];
          console.log(response.data);
          // Extract unique values for filter options
          const genres = [
            ...new Set(books.map((book) => book.genre).filter(Boolean)),
          ];
          const formats = [
            ...new Set(books.map((book) => book.format).filter(Boolean)),
          ];
          const publishers = [
            ...new Set(books.map((book) => book.publisher).filter(Boolean)),
          ];
          const languages = [
            ...new Set(books.map((book) => book.language).filter(Boolean)),
          ];

          console.log("Extracted filter options:", {
            genres,
            formats,
            publishers,
            languages,
          });

          setFilterOptions((prev) => ({
            ...prev,
            genres,
            formats,
            publishers,
            languages,
          }));
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch books using BookService based on filters
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        // Prepare query parameters from filters
        const params = {
          PageNumber: currentPage,
          PageSize: pageSize,
          SortBy: filters.SortBy,
          SortOrder: filters.SortOrder,
        };

        // Add filter parameters (only if they have values)
        if (filters.Title) params.Title = filters.Title;
        if (filters.Author) params.Author = filters.Author;
        if (filters.Genre) params.Genre = filters.Genre;
        if (filters.Format) params.Format = filters.Format;
        if (filters.Publisher) params.Publisher = filters.Publisher;
        if (filters.Language) params.Language = filters.Language;
        if (filters.MinPrice) params.MinPrice = filters.MinPrice;
        if (filters.MaxPrice) params.MaxPrice = filters.MaxPrice;
        if (filters.IsAvailableInLibrary) params.IsAvailableInLibrary = true;
        if (filters.InStock) params.InStock = true;
        if (filters.OnSale) params.OnSale = true;
        if (filters.ExclusiveEdition)
          params.ExclusiveEdition = filters.ExclusiveEdition;

        // Handle active tab filter
        switch (activeTab) {
          case "thisWeek":
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            params.AddedAfter = weekAgo.toISOString();
            break;
          case "thisMonth":
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            params.AddedAfter = monthAgo.toISOString();
            break;
          default: // 'today'
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            params.AddedAfter = today.toISOString();
            break;
        }

        console.log("Fetching books with params:", params);

        // Use the SearchFilterBooks endpoint with proper params
        const response = await BookService.searchBooks(params);

        if (response && response.isSuccess) {
          setBooks(response.data || []);
          setTotalPages(2);
        } else {
          setError("Failed to load books. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        setError("An error occurred while fetching books.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage, pageSize, filters, activeTab]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Add to cart handler
  const handleAddToCart = async (bookId) => {
    if (!userId) {
      showToast({
        type: "info",
        message: "Please login to add items to your cart",
        title: "Authentication Required",
      });
      return;
    }

    try {
      setCartLoading(true);
      const response = await CartService.addToCart(bookId, 1);
      if (response.isSuccess) {
        showToast({
          type: "success",
          message: "Book added to cart successfully!",
          title: "Added to Cart",
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        message: error.message || "Failed to add book to cart",
        title: "Error",
      });
    } finally {
      setCartLoading(false);
    }
  };

  // Add to wishlist handler
  const handleAddToWishlist = async (bookId) => {
    if (!userId) {
      showToast({
        type: "info",
        message: "Please login to bookmark books",
        title: "Authentication Required",
      });
      return;
    }

    try {
      setWishlistLoading(true);

      // Check if book is already in wishlist
      const isInWishlist = wishlistItems.includes(bookId);

      if (isInWishlist) {
        // Remove from wishlist
        const response = await WishlistService.removeFromWishlist(bookId);
        if (response.isSuccess) {
          // Update local state
          setWishlistItems(wishlistItems.filter((id) => id !== bookId));
          showToast({
            type: "success",
            message: "Book removed from your bookmarks",
            title: "Removed from Bookmarks",
          });
        }
      } else {
        // Add to wishlist
        const response = await WishlistService.addToWishlist(bookId);
        if (response.isSuccess) {
          // Update local state
          setWishlistItems([...wishlistItems, bookId]);
          showToast({
            type: "success",
            message: "Book added to your bookmarks",
            title: "Bookmarked",
          });
        }
      }
    } catch (error) {
      showToast({
        type: "error",
        message: error.message || "Failed to update bookmarks",
        title: "Error",
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when tab changes
  };

  // Generate star rating display
  const renderStarRating = (rating = 4.0, reviewCount = 100) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={
              i < Math.floor(rating) ? "text-yellow-500" : "text-gray-500"
            }
          >
            ★
          </span>
        ))}
        <span className="ml-1 font-medium text-[var(--text-primary)]">
          {rating.toFixed(1)}
        </span>
        <span className="ml-1 text-sm text-[var(--text-secondary)]">
          ({reviewCount} reviews)
        </span>
      </div>
    );
  };

  // BookCard component
  const BookCard = ({ book }) => {
    // Check if discount is active
    const currentDate = new Date();
    const isDiscountActive =
      book.onSale &&
      book.discountPercentage &&
      (!book.discountStartDate ||
        new Date(book.discountStartDate) <= currentDate) &&
      (!book.discountEndDate || new Date(book.discountEndDate) >= currentDate);

    // Calculate discounted price
    const originalPrice = book.price;
    const discountedPrice = isDiscountActive
      ? book.price * (1 - book.discountPercentage / 100)
      : book.price;

    // Calculate discount percentage for display
    const discountPercentage = isDiscountActive
      ? book.discountPercentage
      : Math.round(
          ((book.originalPrice - book.price) / book.originalPrice) * 100
        ) || 0;

    // Format tags (limit to 3)
    const tags = [];
    if (book.genre) tags.push(book.genre);
    if (book.format) tags.push(book.format);
    if (book.exclusiveEdition) tags.push(book.exclusiveEdition);
    if (book.language && tags.length < 3) tags.push(book.language);

    // Check if book is in wishlist
    const isBookmarked = wishlistItems.includes(book.bookId);

    return (
      <div className="bg-[var(--surface)] rounded-md mb-4 overflow-hidden w-full">
        <div className="p-6 flex">
          {/* Left: Book image with wishlist button */}
          <div className="relative">
            <div className="w-[100px] h-[120px] flex-shrink-0 mr-6 bg-neutral-100 dark:bg-[#1b2439] rounded overflow-hidden">
              <img
                src={book.bookPhoto || "/api/placeholder/100/120"}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToWishlist(book.bookId);
              }}
              disabled={wishlistLoading}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
            >
              <Heart size={16} fill={isBookmarked ? "white" : "none"} />
            </button>
          </div>

          {/* Right: Book details */}
          <div className="flex-1 flex flex-col">
            <div className="mb-1">
              {/* Title and rating */}
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  {book.title}
                </h3>
                {/* <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < Math.floor(book.rating || 4)
                          ? "text-yellow-500"
                          : "text-neutral-600"
                      }
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-1 text-[var(--text-primary)]">
                    {(book.rating || 4.0).toFixed(1)}
                  </span>
                  <span className="ml-1 text-xs text-[var(--text-secondary)]">
                    ({book.reviewCount || 100} reviews)
                  </span>
                </div> */}
              </div>

              {/* Tags row */}
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5 rounded-md bg-primary-600/20 text-primary-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Author/Publisher information */}
            <div className="text-[var(--text-secondary)] text-sm mt-1">
              <div className="flex items-center gap-x-2">
                <span>{book.author}</span>
                {book.publisher && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]"></span>
                    <span>{book.publisher}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-x-2 mt-1">
                <span>
                  {book.publicationDate
                    ? new Date(book.publicationDate).getFullYear()
                    : book.year || ""}
                </span>
              </div>
            </div>

            {/* Price and action row at the bottom */}
            <div className="mt-auto flex justify-between items-center pt-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[var(--text-primary)]">
                    ${(book.price || 0).toFixed(2)}
                  </span>
                  {book.originalPrice && (
                    <>
                      <span className="text-sm text-[var(--text-secondary)] line-through">
                        ${book.originalPrice.toFixed(2)}
                      </span>
                      <span className="bg-red-600/20 text-red-500 dark:text-red-400 text-xs px-2 py-0.5 rounded">
                        {discountPercentage}% Off
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Add to cart button or Out of Stock */}
              <div>
                {book.stock > 0 ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(book.bookId);
                    }}
                    disabled={cartLoading}
                    className="py-2 px-6 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
                  >
                    {cartLoading ? "Adding..." : "Add to cart"}
                  </button>
                ) : (
                  <button
                    disabled
                    className="py-2 px-6 rounded-md bg-neutral-600 text-white cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render content function with fixed layout
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-900/20 border border-red-800 text-red-100 p-4 rounded-md mb-4 w-full">
          <p className="font-medium">{error}</p>
        </div>
      );
    }

    if (!books || books.length === 0) {
      return (
        <div className="bg-[var(--surface)] text-left p-6 rounded-md w-full">
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            No books found
          </h3>
          <p className="text-[var(--text-secondary)]">
            Try adjusting your filters to find what you're looking for.
          </p>
        </div>
      );
    }

    return (
      <>
        {/* Books list */}
        <div className="space-y-4 w-full">
          {books.map((book) => (
            <Link
              to={`/user/book/${book.bookId}`}
              key={book.bookId}
              className="block w-full"
            >
              <BookCard book={book} />
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-1">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-md ${
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-primary-700"
                } bg-primary-600 text-white`}
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === pageNum
                        ? "bg-primary-600 text-white"
                        : "bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && (
                <span className="px-3 py-2 text-[var(--text-primary)]">
                  ...
                </span>
              )}

              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-md ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-primary-700"
                } bg-primary-600 text-white`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)] w-full">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)]">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex items-center text-sm py-2">
            <a href="/home" className="text-primary-600 hover:text-primary-500">
              Home
            </a>
            <span className="mx-2 text-[var(--text-secondary)]">/</span>
            <span className="text-[var(--text-secondary)]">Books</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-8">
          {/* Left - Filter Panel */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-[var(--surface)] rounded-md overflow-hidden border border-[var(--border)] sticky top-4">
              <div className="p-4 border-b border-[var(--border)]">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Filter Option
                </h2>
              </div>

              <div className="p-4 space-y-4">
                {/* Publisher Select */}
                <div>
                  <h3 className="font-medium text-[var(--text-secondary)] mb-2">
                    Choose Publisher
                  </h3>
                  <select
                    className="w-full p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] appearance-none"
                    name="Publisher"
                    value={filters.Publisher}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Publishers</option>
                    {filterOptions.publishers.length > 0 ? (
                      filterOptions.publishers.map((publisher, idx) => (
                        <option key={idx} value={publisher}>
                          {publisher}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading publishers...</option>
                    )}
                  </select>
                </div>

                {/* Year Select */}
                <div>
                  <h3 className="font-medium text-[var(--text-secondary)] mb-2">
                    Select Year
                  </h3>
                  <select
                    className="w-full p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] appearance-none"
                    name="PublicationYear"
                  >
                    <option value="">All Years</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i} value={2025 - i}>
                        {2025 - i}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Genre Select */}
                <div>
                  <h3 className="font-medium text-[var(--text-secondary)] mb-2">
                    Genre
                  </h3>
                  <select
                    className="w-full p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] appearance-none"
                    name="Genre"
                    value={filters.Genre}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Genres</option>
                    {filterOptions.genres.length > 0 ? (
                      filterOptions.genres.map((genre, idx) => (
                        <option key={idx} value={genre}>
                          {genre}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading genres...</option>
                    )}
                  </select>
                </div>

                {/* Format Select */}
                <div>
                  <h3 className="font-medium text-[var(--text-secondary)] mb-2">
                    Format
                  </h3>
                  <select
                    className="w-full p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] appearance-none"
                    name="Format"
                    value={filters.Format}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Formats</option>
                    {filterOptions.formats.length > 0 ? (
                      filterOptions.formats.map((format, idx) => (
                        <option key={idx} value={format}>
                          {format}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading formats...</option>
                    )}
                  </select>
                </div>

                {/* Language Select */}
                <div>
                  <h3 className="font-medium text-[var(--text-secondary)] mb-2">
                    Language
                  </h3>
                  <select
                    className="w-full p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] appearance-none"
                    name="Language"
                    value={filters.Language}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Languages</option>
                    {filterOptions.languages.length > 0 ? (
                      filterOptions.languages.map((language, idx) => (
                        <option key={idx} value={language}>
                          {language}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading languages...</option>
                    )}
                  </select>
                </div>

                {/* Exclusive Edition Select */}
                <div>
                  <h3 className="font-medium text-[var(--text-secondary)] mb-2">
                    Exclusive Edition
                  </h3>
                  <select
                    className="w-full p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] appearance-none"
                    name="ExclusiveEdition"
                    value={filters.ExclusiveEdition}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Editions</option>
                    {filterOptions.exclusiveEditions.map((edition, idx) => (
                      <option key={idx} value={edition}>
                        {edition}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-medium text-[var(--text-secondary)] mb-2">
                    Price Range
                  </h3>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="MinPrice"
                      value={filters.MinPrice}
                      onChange={handleFilterChange}
                      placeholder="Min"
                      className="w-1/2 p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                    />
                    <input
                      type="number"
                      name="MaxPrice"
                      value={filters.MaxPrice}
                      onChange={handleFilterChange}
                      placeholder="Max"
                      className="w-1/2 p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                {/* Additional Checkboxes */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="InStock"
                      name="InStock"
                      checked={filters.InStock}
                      onChange={handleFilterChange}
                      className="mr-2 rounded bg-[var(--surface)] border-[var(--border)]"
                    />
                    <label
                      htmlFor="InStock"
                      className="text-sm text-[var(--text-secondary)]"
                    >
                      In Stock Only
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="IsAvailableInLibrary"
                      name="IsAvailableInLibrary"
                      checked={filters.IsAvailableInLibrary}
                      onChange={handleFilterChange}
                      className="mr-2 rounded bg-[var(--surface)] border-[var(--border)]"
                    />
                    <label
                      htmlFor="IsAvailableInLibrary"
                      className="text-sm text-[var(--text-secondary)]"
                    >
                      Available in Library
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="OnSale"
                      name="OnSale"
                      checked={filters.OnSale}
                      onChange={handleFilterChange}
                      className="mr-2 rounded bg-[var(--surface)] border-[var(--border)]"
                    />
                    <label
                      htmlFor="OnSale"
                      className="text-sm text-[var(--text-secondary)]"
                    >
                      On Sale
                    </label>
                  </div>
                </div>

                {/* Reset button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setFilters({
                        Title: "",
                        Author: "",
                        Genre: "",
                        Format: "",
                        Publisher: "",
                        Language: "",
                        MinPrice: "",
                        MaxPrice: "",
                        IsAvailableInLibrary: false,
                        InStock: false,
                        OnSale: false,
                        ExclusiveEdition: "",
                        SortBy: "Price",
                        SortOrder: "asc",
                      });
                      setCurrentPage(1);
                    }}
                    className="w-full p-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Books Content */}
          <div className="col-span-12 lg:col-span-9">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div className="flex items-center mb-4 md:mb-0">
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mr-4">
                  Books
                </h1>

                {/* Tabs */}
                <div className="border-b border-[var(--border)]">
                  <button
                    className={`px-4 py-2 ${
                      activeTab === "today"
                        ? "border-b-2 border-primary-600 text-primary-600 font-medium"
                        : "text-[var(--text-secondary)]"
                    }`}
                    onClick={() => handleTabChange("today")}
                  >
                    Today
                  </button>
                  <button
                    className={`px-4 py-2 ${
                      activeTab === "thisWeek"
                        ? "border-b-2 border-primary-600 text-primary-600 font-medium"
                        : "text-[var(--text-secondary)]"
                    }`}
                    onClick={() => handleTabChange("thisWeek")}
                  >
                    This Week
                  </button>
                  <button
                    className={`px-4 py-2 ${
                      activeTab === "thisMonth"
                        ? "border-b-2 border-primary-600 text-primary-600 font-medium"
                        : "text-[var(--text-secondary)]"
                    }`}
                    onClick={() => handleTabChange("thisMonth")}
                  >
                    This Month
                  </button>
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center">
                <select
                  className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)]"
                  value={`${filters.SortBy}-${filters.SortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("-");
                    setFilters({
                      ...filters,
                      SortBy: sortBy,
                      SortOrder: sortOrder,
                    });
                  }}
                >
                  <option value="Price-asc">Price: Low to High</option>
                  <option value="Price-desc">Price: High to Low</option>
                  <option value="Title-asc">Title: A to Z</option>
                  <option value="Title-desc">Title: Z to A</option>
                  <option value="AddedDate-desc">Newest Arrivals</option>
                </select>
              </div>
            </div>
            {/* Dynamic content based on state */}
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
