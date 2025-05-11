import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectTheme } from "../../features/userSlice";
import BookService from "../../services/BooksServices";
import ReviewService from "../../services/ReviewService";
import WishlistService from "../../services/WishlistService";
import CartService from "../../services/CartService";
import { useToast } from "../../components/Toast";
import ReviewModal from "../../components/ReviewModal";
import {
  StarIcon as StarOutlineIcon,
  HeartIcon,
  ShareIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon,
  BookOpenIcon,
  ClockIcon,
  ChevronDownIcon,
  ShoppingBagIcon,
  BookmarkIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarSolidIcon,
  HeartIcon as HeartSolidIcon,
} from "@heroicons/react/24/solid";

const SingleBook = () => {
  const { bookId } = useParams();
  const { showToast } = useToast();
  const theme = useSelector(selectTheme);
  const navigate = useNavigate();

  // State
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Authentication state (simplified)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isCheckingReviewEligibility, setIsCheckingReviewEligibility] =
    useState(false);

  // Simple user object for demonstration
  const user = {
    id: localStorage.getItem("userId") || null,
    fullName: localStorage.getItem("fullName") || "Guest",
  };

  // Initial data fetching
  useEffect(() => {
    fetchBookDetails();
    fetchReviews();

    // Check if user is authenticated by looking for token in localStorage
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    // If authenticated, check review eligibility and wishlist status
    if (token) {
      checkReviewEligibility();
      checkWishlistStatus();
    }
  }, [bookId]);

  // Check if book is in wishlist
  const checkWishlistStatus = async () => {
    try {
      const inWishlist = await WishlistService.isBookInWishlist(bookId);
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  // Fetch book details
  const fetchBookDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await BookService.getBookById(bookId);
      if (response.isSuccess && response.data) {
        setBook(response.data);
        // Fetch related books once we have the main book data
        fetchRelatedBooks(response.data.genre);
      } else {
        throw new Error(response.message || "Failed to fetch book details");
      }
    } catch (error) {
      console.error("Error fetching book:", error);
      setError("Failed to load book details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch related books based on genre
  const fetchRelatedBooks = async (genre) => {
    setRelatedLoading(true);
    try {
      const response = await BookService.searchBooks({
        genre: genre,
        pageSize: 4,
        pageNumber: 1,
        excludeId: bookId,
      });

      if (response.isSuccess && response.data) {
        setRelatedBooks(response.data.items || []);
      } else {
        setRelatedBooks([]);
      }
    } catch (error) {
      console.error("Error fetching related books:", error);
      setRelatedBooks([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  // Fetch reviews for this book
  const fetchReviews = async () => {
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const response = await ReviewService.getBookReviews(bookId);
      if (response.isSuccess && response.data) {
        setReviews(response.data);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviewsError("Failed to load reviews. Please try again.");
    } finally {
      setReviewsLoading(false);
    }
  };

  // Check if the user is eligible to review this book
  const checkReviewEligibility = async () => {
    if (!isAuthenticated || !bookId) return;

    setIsCheckingReviewEligibility(true);
    try {
      const response = await ReviewService.checkReviewEligibility(bookId);
      setCanReview(response.isSuccess);
    } catch (error) {
      console.error("Error checking review eligibility:", error);
      setCanReview(false);
    } finally {
      setIsCheckingReviewEligibility(false);
    }
  };

  // Handle quantity changes
  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // Handle add to cart
  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          message: "Please log in to add items to your cart",
          redirectTo: `/books/${bookId}`,
        },
      });
      return;
    }

    setIsAddingToCart(true);
    try {
      // Call cart service to add item
      const response = await CartService.addToCart(bookId, quantity);

      if (response.isSuccess) {
        showToast({
          type: "success",
          title: "Added to Cart",
          message: `${book.title} (×${quantity}) has been added to your cart.`,
          duration: 3000,
        });
      } else {
        throw new Error(response.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to add to cart. Please try again.",
        duration: 4000,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      showToast({
        type: "info",
        title: "Authentication Required",
        message: "Please sign in to add books to your wishlist.",
        duration: 3000,
      });
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        // Remove from wishlist
        await WishlistService.removeFromWishlist(bookId);
        setIsInWishlist(false);
        showToast({
          type: "success",
          title: "Removed from Wishlist",
          message: `${book.title} has been removed from your wishlist.`,
          duration: 3000,
        });
      } else {
        // Add to wishlist
        await WishlistService.addToWishlist(bookId);
        setIsInWishlist(true);
        showToast({
          type: "success",
          title: "Added to Wishlist",
          message: `${book.title} has been added to your wishlist.`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to update wishlist. Please try again.",
        duration: 3000,
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  // Handle share
  const handleShare = (platform) => {
    const url = window.location.href;
    const title = book ? book.title : "Check out this book";

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(title)}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(
            title + ": " + url
          )}`,
          "_blank"
        );
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(
          title
        )}&body=${encodeURIComponent("Check out this book: " + url)}`;
        break;
      default:
        break;
    }
  };

  // Handle review submission
  const handleReviewSubmitted = () => {
    fetchReviews();
    setCanReview(false);
    setShowReviewModal(false);
    showToast({
      type: "success",
      title: "Review Submitted",
      message: "Thank you for your review!",
      duration: 3000,
    });
  };

  // Format price with discount
  const formatPrice = (price, discount = 0) => {
    const discountedPrice = price - (price * discount) / 100;
    return {
      original: price.toFixed(2),
      discounted: discountedPrice.toFixed(2),
      hasDiscount: discount > 0,
      discountPercent: discount,
    };
  };

  // Generate star rating display
  const renderStarRating = (rating = 0, size = "sm") => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const sizeClasses = size === "lg" ? "h-5 w-5" : "h-4 w-4";

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            // Full star
            return (
              <StarSolidIcon
                key={i}
                className={`${sizeClasses} text-warning-500`}
              />
            );
          } else if (i === fullStars && hasHalfStar) {
            // Half star (we'll use a filled star for simplicity)
            return (
              <StarSolidIcon
                key={i}
                className={`${sizeClasses} text-warning-500 opacity-70`}
              />
            );
          } else {
            // Empty star
            return (
              <StarOutlineIcon
                key={i}
                className={`${sizeClasses} text-[var(--text-tertiary)]`}
              />
            );
          }
        })}
      </div>
    );
  };

  // Generate rating distribution display
  const renderRatingDistribution = () => {
    if (!book || !book.ratingDistribution) return null;

    // If there's no ratingDistribution field, create a sample distribution based on the averageRating
    const distribution = book.ratingDistribution || [];

    // If empty, generate a sample distribution based on average rating
    if (distribution.length === 0 && book.averageRating && book.reviewCount) {
      // Calculate a plausible distribution centered around the average rating
      const avgRating = book.averageRating;
      const totalReviews = book.reviewCount;

      // Create a simple bell curve distribution centered on the average rating
      const simulatedDistribution = [
        {
          stars: 5,
          count: Math.round(
            totalReviews * (avgRating >= 4.5 ? 0.7 : avgRating >= 4 ? 0.5 : 0.2)
          ),
        },
        {
          stars: 4,
          count: Math.round(
            totalReviews * (avgRating >= 4 && avgRating < 4.5 ? 0.5 : 0.25)
          ),
        },
        {
          stars: 3,
          count: Math.round(
            totalReviews * (avgRating >= 3 && avgRating < 4 ? 0.4 : 0.2)
          ),
        },
        {
          stars: 2,
          count: Math.round(
            totalReviews * (avgRating >= 2 && avgRating < 3 ? 0.3 : 0.1)
          ),
        },
        {
          stars: 1,
          count: Math.round(totalReviews * (avgRating < 2 ? 0.4 : 0.05)),
        },
      ];

      // Adjust to make sure the total adds up to reviewCount
      const currentTotal = simulatedDistribution.reduce(
        (sum, item) => sum + item.count,
        0
      );
      if (currentTotal !== totalReviews) {
        const diff = totalReviews - currentTotal;
        simulatedDistribution[0].count += diff; // Adjust the 5-star count to make up the difference
      }

      return renderDistributionUI(simulatedDistribution);
    }

    return renderDistributionUI(distribution);
  };

  // Helper function to render the distribution UI
  const renderDistributionUI = (distribution) => {
    const totalRatings = distribution.reduce(
      (sum, item) => sum + item.count,
      0
    );

    return (
      <div className="space-y-2 mt-4">
        {[5, 4, 3, 2, 1].map((stars) => {
          const distributionItem = distribution.find(
            (item) => item.stars === stars
          ) || { count: 0 };

          const percentage =
            totalRatings > 0
              ? (distributionItem.count / totalRatings) * 100
              : 0;

          return (
            <div key={stars} className="flex items-center">
              <div className="flex items-center w-12">
                <span className="text-sm text-[var(--text-secondary)] mr-1">
                  {stars}
                </span>
                <StarSolidIcon className="h-3.5 w-3.5 text-warning-500" />
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-2">
                <div
                  className="h-full bg-warning-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="w-12 text-right text-xs text-[var(--text-tertiary)]">
                {percentage.toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Book image skeleton */}
            <div className="md:col-span-1">
              <div className="rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse aspect-[3/4]"></div>
            </div>

            {/* Book details skeleton */}
            <div className="md:col-span-2 space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md w-3/4"></div>
              <div className="flex space-x-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md w-16"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md w-16"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md w-1/3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md w-3/4"></div>
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md w-1/3"></div>
              <div className="flex space-x-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md w-1/3"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ExclamationCircleIcon className="h-16 w-16 text-error-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Something went wrong
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">{error}</p>
          <button
            onClick={fetchBookDetails}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1.5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Proceed with rendering when data is available
  if (!book) return null;

  const priceInfo = formatPrice(book.price, book.discount);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="text-sm flex items-center text-[var(--text-tertiary)]">
          <Link to="/user/" className="hover:text-primary-500">
            Home
          </Link>

          <ChevronRightIcon className="h-4 w-4 mx-1" />
          <span className="text-[var(--text-secondary)] truncate max-w-[200px]">
            {book.title}
          </span>
        </div>
      </div>

      {/* Book Details */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Book Image - Reduced size and height */}
            <div className="md:col-span-1">
              <div className="sticky top-8">
                <div className="bg-[var(--surface)] rounded-lg overflow-hidden shadow-md border border-[var(--border)] flex items-center justify-center h-64 md:h-80">
                  {book.bookPhoto ? (
                    <img
                      src={book.bookPhoto}
                      alt={book.title}
                      className="w-full h-full object-contain max-w-xs" /* Changed to object-contain with max-width */
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center h-full w-full">
                      <BookOpenIcon className="h-16 w-16 text-[var(--text-tertiary)] mb-4" />
                      <p className="text-[var(--text-secondary)] text-lg font-medium">
                        {book.title}
                      </p>
                      <p className="text-[var(--text-tertiary)] text-sm">
                        {book.author}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Book Info */}
            <div className="md:col-span-2">
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">
                {book.title}
              </h1>

              {/* Ratings */}
              <div className="flex items-center mb-4">
                {renderStarRating(book.averageRating, "lg")}
                <span className="ml-2 text-[var(--text-secondary)] font-medium">
                  {book.averageRating ? book.averageRating.toFixed(1) : "0.0"}
                </span>
                <span className="mx-2 text-[var(--text-tertiary)]">•</span>
                <span className="text-[var(--text-secondary)]">
                  {reviews.length || 0}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </span>
                {book.likeCount > 0 && (
                  <>
                    <span className="mx-2 text-[var(--text-tertiary)]">•</span>
                    <span className="text-[var(--text-secondary)] flex items-center">
                      <HeartIcon className="h-4 w-4 text-primary-500 mr-1" />
                      {book.likeCount} {book.likeCount === 1 ? "like" : "likes"}
                    </span>
                  </>
                )}
              </div>

              {/* Author & Publisher */}
              <div className="mb-4">
                <div className="flex items-center space-x-4">
                  {book.author && (
                    <div className="flex items-center">
                      <span className="text-[var(--text-tertiary)]">
                        Written by:
                      </span>
                      <span className="ml-1 text-[var(--text-primary)] font-medium">
                        {book.author}
                      </span>
                    </div>
                  )}

                  {book.publisher && (
                    <div className="flex items-center">
                      <span className="text-[var(--text-tertiary)]">
                        Publisher:
                      </span>
                      <span className="ml-1 text-[var(--text-primary)] font-medium">
                        {book.publisher}
                      </span>
                    </div>
                  )}

                  {book.publicationYear && (
                    <div className="flex items-center">
                      <span className="text-[var(--text-tertiary)]">Year:</span>
                      <span className="ml-1 text-[var(--text-primary)] font-medium">
                        {book.publicationYear}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {book.description}
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                {book.isAvailableInLibrary ? (
                  <div className="inline-flex items-center px-3 py-1 bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300 text-sm font-medium rounded-full border border-success-200 dark:border-success-800">
                    <span className="w-2 h-2 bg-success-500 rounded-full mr-1.5"></span>
                    In Stock
                  </div>
                ) : (
                  <div className="inline-flex items-center px-3 py-1 bg-error-100 dark:bg-error-900/30 text-error-800 dark:text-error-300 text-sm font-medium rounded-full border border-error-200 dark:border-error-800">
                    <span className="w-2 h-2 bg-error-500 rounded-full mr-1.5"></span>
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Price & Add to Cart */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div>
                    <span className="text-2xl font-bold text-[var(--text-primary)]">
                      ${priceInfo.discounted}
                    </span>
                    {priceInfo.hasDiscount && (
                      <span className="ml-2 text-[var(--text-tertiary)] line-through">
                        ${priceInfo.original}
                      </span>
                    )}
                    {priceInfo.hasDiscount && (
                      <span className="ml-2 inline-block px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-sm font-medium rounded-md border border-primary-200 dark:border-primary-800">
                        -{priceInfo.discountPercent}%
                      </span>
                    )}
                  </div>
                </div>

                {book.isAvailableInLibrary && (
                  <div className="flex items-center space-x-3">
                    {/* Quantity selector - slightly smaller */}
                    <div className="flex items-center border border-[var(--border)] rounded-md">
                      <button
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] focus:outline-none disabled:opacity-50"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="px-2 text-[var(--text-primary)] font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={increaseQuantity}
                        className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] focus:outline-none"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Add to cart button - with loading state */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || !book.isAvailableInLibrary}
                      className="w-fit inline-flex justify-center items-center px-14 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed"
                    >
                      {isAddingToCart ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingBagIcon className="h-4 w-4 mr-1.5" />
                          Add to Cart
                        </>
                      )}
                    </button>

                    {/* Wishlist button - with state indication */}
                    <button
                      onClick={handleWishlistToggle}
                      disabled={wishlistLoading}
                      className={`p-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                        isInWishlist
                          ? "bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-400"
                          : "border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                      }`}
                      aria-label={
                        isInWishlist
                          ? "Remove from Wishlist"
                          : "Add to Wishlist"
                      }
                    >
                      {wishlistLoading ? (
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : isInWishlist ? (
                        <HeartSolidIcon className="h-4 w-4 text-primary-600" />
                      ) : (
                        <HeartIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="border-b border-[var(--border)] mb-6">
            <nav className="flex -mb-px space-x-8">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "details"
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--border)]"
                }`}
              >
                Details Product
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "reviews"
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--border)]"
                }`}
              >
                Customer Reviews
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                    About this book
                  </h2>
                  <div className="text-[var(--text-secondary)] space-y-4">
                    <p>{book.description}</p>
                    {book.longDescription && <p>{book.longDescription}</p>}
                  </div>

                  {/* Additional Details */}
                  {book.tableOfContents && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3">
                        Table of Contents
                      </h3>
                      <div className="text-[var(--text-secondary)]">
                        {book.tableOfContents}
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-1">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                    Product Details
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-[var(--border)]">
                      <span className="text-[var(--text-tertiary)]">Title</span>
                      <span className="text-[var(--text-primary)] font-medium">
                        {book.title}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[var(--border)]">
                      <span className="text-[var(--text-tertiary)]">
                        Author
                      </span>
                      <span className="text-[var(--text-primary)] font-medium">
                        {book.author}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[var(--border)]">
                      <span className="text-[var(--text-tertiary)]">
                        Publisher
                      </span>
                      <span className="text-[var(--text-primary)] font-medium">
                        {book.publisher}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[var(--border)]">
                      <span className="text-[var(--text-tertiary)]">
                        Publication Date
                      </span>
                      <span className="text-[var(--text-primary)] font-medium">
                        {book.publicationDate}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[var(--border)]">
                      <span className="text-[var(--text-tertiary)]">ISBN</span>
                      <span className="text-[var(--text-primary)] font-medium">
                        {book.isbn}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[var(--border)]">
                      <span className="text-[var(--text-tertiary)]">
                        Language
                      </span>
                      <span className="text-[var(--text-primary)] font-medium">
                        {book.language}
                      </span>
                    </div>
                    {/* Only show if page count is available */}
                    {book.pageCount && (
                      <div className="flex justify-between py-2 border-b border-[var(--border)]">
                        <span className="text-[var(--text-tertiary)]">
                          Pages
                        </span>
                        <span className="text-[var(--text-primary)] font-medium">
                          {book.pageCount}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-[var(--border)]">
                      <span className="text-[var(--text-tertiary)]">
                        Format
                      </span>
                      <span className="text-[var(--text-primary)] font-medium">
                        {book.format}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[var(--border)]">
                      <span className="text-[var(--text-tertiary)]">Genre</span>
                      <span className="text-[var(--text-primary)] font-medium">
                        {book.genre}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                    Rating Information
                  </h2>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {renderStarRating(book.averageRating || 0, "lg")}
                    </div>
                    <div className="ml-2">
                      <span className="text-2xl font-bold text-[var(--text-primary)]">
                        {book.averageRating
                          ? book.averageRating.toFixed(1)
                          : "0.0"}
                      </span>
                      <span className="text-sm text-[var(--text-tertiary)] ml-1">
                        out of 5
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] mb-4">
                    Based on {reviews.length || 0}{" "}
                    {reviews.length === 1 ? "review" : "reviews"}
                  </div>

                  {/* Rating Distribution */}
                  {renderRatingDistribution()}

                  {/* Write a Review Button or Login Prompt */}
                  <div className="mt-6">
                    {isAuthenticated ? (
                      isCheckingReviewEligibility ? (
                        <div className="text-center py-2">
                          <div className="inline-block animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full mr-2"></div>
                          <span className="text-[var(--text-secondary)]">
                            Checking eligibility...
                          </span>
                        </div>
                      ) : canReview ? (
                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <StarOutlineIcon className="h-5 w-5 mr-1.5" />
                          Write a Review
                        </button>
                      ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
                          <p className="text-sm text-[var(--text-tertiary)]">
                            You can only review books you've purchased
                          </p>
                          <button
                            onClick={handleAddToCart}
                            className="mt-2 inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            <ShoppingBagIcon className="h-4 w-4 mr-1" />
                            Add to cart
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-[var(--border)] rounded-lg text-center">
                        <p className="text-sm text-[var(--text-secondary)] mb-3">
                          Sign in to write a review
                        </p>
                        <Link
                          to="/auth/login"
                          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Sign In
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                      Customer Reviews
                    </h2>

                    <div className="relative">
                      <select
                        className="appearance-none bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                        defaultValue="newest"
                      >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-tertiary)]">
                        <ChevronDownIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  {reviewsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                    </div>
                  ) : reviewsError ? (
                    <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4 my-4">
                      <p className="text-error-700 dark:text-error-400">
                        {reviewsError}
                      </p>
                      <button
                        onClick={fetchReviews}
                        className="mt-2 text-primary-600 hover:text-primary-500 font-medium text-sm inline-flex items-center"
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-1" />
                        Try Again
                      </button>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
                      <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto text-[var(--text-tertiary)] mb-3" />
                      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
                        No Reviews Yet
                      </h3>
                      <p className="text-[var(--text-secondary)]">
                        Be the first to share your thoughts!
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-[var(--text-tertiary)] mb-4">
                        Showing {reviews.length} of {reviews.length} reviews
                      </p>

                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div
                            key={review.reviewId}
                            className="border border-[var(--border)] rounded-lg p-4 bg-[var(--surface)]"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium">
                                  {review.fullName
                                    ? review.fullName
                                        .substring(0, 1)
                                        .toUpperCase()
                                    : "U"}
                                </div>
                                <div className="ml-3">
                                  <h4 className="text-[var(--text-primary)] font-medium">
                                    {review.fullName || "Anonymous User"}
                                  </h4>
                                  <p className="text-xs text-[var(--text-tertiary)]">
                                    {new Date(
                                      review.createdTime
                                    ).toLocaleDateString(undefined, {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>

                              {/* Delete button - only show if user owns the review */}
                              {isAuthenticated &&
                                user &&
                                user.id === review.userId && (
                                  <button
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          "Are you sure you want to delete your review?"
                                        )
                                      ) {
                                        ReviewService.deleteReview(
                                          review.reviewId
                                        )
                                          .then(() => {
                                            fetchReviews();
                                            setCanReview(true);
                                            showToast({
                                              type: "success",
                                              title: "Review Deleted",
                                              message:
                                                "Your review has been deleted successfully.",
                                              duration: 3000,
                                            });
                                          })
                                          .catch((err) => {
                                            console.error(
                                              "Failed to delete review:",
                                              err
                                            );
                                            showToast({
                                              type: "error",
                                              title: "Error",
                                              message:
                                                "Failed to delete review. Please try again.",
                                              duration: 4000,
                                            });
                                          });
                                      }
                                    }}
                                    className="text-[var(--text-tertiary)] hover:text-error-500 p-1"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                )}
                            </div>
                            <p className="text-[var(--text-primary)]">
                              {review.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Books Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            Related Books
          </h2>

          {relatedLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 aspect-[3/4] rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : relatedBooks.length === 0 ? (
            <div className="text-center py-8 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
              <BookOpenIcon className="h-12 w-12 mx-auto text-[var(--text-tertiary)] mb-3" />
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
                No Related Books Found
              </h3>
              <p className="text-[var(--text-secondary)]">
                We couldn't find any books with similar genres
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedBooks.map((relatedBook) => (
                <Link
                  key={relatedBook.id}
                  to={`/books/${relatedBook.id}`}
                  className="group"
                >
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-200">
                    <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                      {relatedBook.bookPhoto ? (
                        <img
                          src={relatedBook.bookPhoto}
                          alt={relatedBook.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpenIcon className="h-12 w-12 text-[var(--text-tertiary)]" />
                        </div>
                      )}

                      {relatedBook.discount > 0 && (
                        <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          -{relatedBook.discount}%
                        </div>
                      )}
                    </div>

                    <div className="p-3">
                      <h3 className="font-medium text-[var(--text-primary)] line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {relatedBook.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-1 mb-2">
                        {relatedBook.author}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <StarSolidIcon className="h-4 w-4 text-warning-500 mr-1" />
                          <span className="text-xs text-[var(--text-secondary)]">
                            {relatedBook.averageRating
                              ? relatedBook.averageRating.toFixed(1)
                              : "N/A"}
                          </span>
                        </div>
                        <div>
                          {relatedBook.discount > 0 ? (
                            <div className="text-right">
                              <span className="font-bold text-[var(--text-primary)]">
                                $
                                {(
                                  relatedBook.price *
                                  (1 - relatedBook.discount / 100)
                                ).toFixed(2)}
                              </span>
                              <span className="text-xs text-[var(--text-tertiary)] line-through ml-1">
                                ${relatedBook.price.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-[var(--text-primary)]">
                              ${relatedBook.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          book={{
            id: book.id,
            title: book.title,
            author: book.author,
            image: book.bookPhoto,
          }}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default SingleBook;
