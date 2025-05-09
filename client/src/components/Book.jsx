import React from "react";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import WishlistService from "../../services/WishlistService";
import CartService from "../../services/CartService";
import { useToast } from "../../components/Toast";

const Book = ({
  book,
  isInWishlist = false,
  onAddToWishlist,
  onAddToCart,
  wishlistLoading = false,
  cartLoading = false,
}) => {
  const { showToast } = useToast();

  // Default book data
  const bookData = book || {
    bookId: "1",
    title: "Thunder Stunt",
    rating: 4.0,
    reviewCount: 122,
    categories: ["ADVENTURE", "ACTION", "FANTASY"],
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    author: "Kevin Smiley",
    publisher: "Printarus Studios",
    year: "2019",
    price: 84.78,
    originalPrice: 95.0,
    badges: [
      { text: "Get 20% Discount first order", type: "discount" },
      { text: "10% Off (Discount)", type: "discount" },
      { text: "Add to premium", type: "premium" },
    ],
  };

  // Function to render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={`${
              i < Math.floor(rating)
                ? "text-yellow-500 fill-yellow-500"
                : "text-neutral-600"
            }`}
          />
        ))}
      </div>
    );
  };

  // Add to wishlist with confirmation based on current status
  const handleAddToWishlist = async (e) => {
    e.preventDefault(); // Prevent navigation when clicking the wishlist button
    e.stopPropagation(); // Stop event bubbling

    if (onAddToWishlist) {
      onAddToWishlist(bookData.bookId);
    } else {
      // Standalone functionality if not provided by parent
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showToast({
            type: "info",
            message: "Please login to bookmark books",
            title: "Authentication Required",
          });
          return;
        }

        if (isInWishlist) {
          await WishlistService.removeFromWishlist(bookData.bookId);
          showToast({
            type: "success",
            message: "Book removed from your bookmarks",
            title: "Removed from Bookmarks",
          });
        } else {
          await WishlistService.addToWishlist(bookData.bookId);
          showToast({
            type: "success",
            message: "Book added to your bookmarks",
            title: "Bookmarked",
          });
        }
      } catch (error) {
        showToast({
          type: "error",
          message: error.message || "Failed to update bookmarks",
          title: "Error",
        });
      }
    }
  };

  // Add to cart with confirmation
  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent navigation when clicking the cart button
    e.stopPropagation(); // Stop event bubbling

    if (onAddToCart) {
      onAddToCart(bookData.bookId);
    } else {
      // Standalone functionality if not provided by parent
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          showToast({
            type: "info",
            message: "Please login to add items to your cart",
            title: "Authentication Required",
          });
          return;
        }

        await CartService.addToCart(bookData.bookId, 1);
        showToast({
          type: "success",
          message: "Book added to cart successfully!",
          title: "Added to Cart",
        });
      } catch (error) {
        showToast({
          type: "error",
          message: error.message || "Failed to add book to cart",
          title: "Error",
        });
      }
    }
  };

  return (
    <Link
      to={`/book/${bookData.bookId}`}
      className="block text-[var(--text-primary)]"
    >
      <div className="flex bg-[var(--surface)] text-[var(--text-primary)] p-6 rounded-lg shadow-lg border border-[var(--border)] hover:shadow-primary-900/20 transition-all duration-300">
        {/* Book image */}
        <div className="w-36 h-48 flex-shrink-0 mr-6 bg-neutral-800 rounded-md shadow-md overflow-hidden">
          <img
            src={bookData.bookPhoto || "/api/placeholder/180/240"}
            alt={`${bookData.title} book cover`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Book details */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-[var(--text-primary)] font-display">
              {bookData.title}
            </h3>
            <div className="flex items-center">
              {renderStars(bookData.rating || 4.0)}
              <span className="ml-1 text-sm font-bold text-yellow-500">
                {(bookData.rating || 4.0).toFixed(1)}
              </span>
              <span className="ml-1 text-xs text-[var(--text-secondary)]">
                ({bookData.reviewCount || 0} reviews)
              </span>
            </div>
          </div>

          {/* Book categories */}
          <div className="flex mt-1 mb-2">
            {(bookData.categories || []).map((category, index) => (
              <span
                key={index}
                className="text-xs mr-3 text-primary-400 font-medium uppercase tracking-wide"
              >
                {category}
              </span>
            ))}
          </div>

          {/* Book description */}
          <p className="text-sm text-[var(--text-secondary)] mt-2 font-body">
            {bookData.description}
          </p>

          {/* Book metadata */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Written by</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {bookData.author}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Publisher</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {bookData.publisher}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Year</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {bookData.publicationDate
                  ? new Date(bookData.publicationDate).getFullYear()
                  : bookData.year}
              </p>
            </div>
          </div>

          {/* Price and actions */}
          <div className="mt-6 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-[var(--text-primary)]">
                  $ {bookData.price.toFixed(2)}
                </span>
                {bookData.originalPrice && (
                  <span className="text-sm text-[var(--text-secondary)] line-through">
                    ${bookData.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex gap-2 items-center mt-2">
                {bookData.badges &&
                  bookData.badges.map((badge, index) => {
                    const badgeClass =
                      badge.type === "discount"
                        ? "bg-success-900/30 text-success-400"
                        : badge.type === "premium"
                        ? "bg-info-900/30 text-info-400"
                        : "bg-warning-900/30 text-warning-400";

                    return (
                      <span
                        key={index}
                        className={`text-xs px-3 py-1 rounded-md ${badgeClass}`}
                      >
                        {badge.text}
                      </span>
                    );
                  })}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-lg shadow-primary-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleAddToCart}
                disabled={cartLoading}
              >
                {cartLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    <span>Add to cart</span>
                  </>
                )}
              </button>
              <button
                className={`${
                  isInWishlist
                    ? "bg-primary-600 hover:bg-primary-700"
                    : "bg-neutral-800 hover:bg-neutral-700"
                } p-2 rounded-lg transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed`}
                onClick={handleAddToWishlist}
                disabled={wishlistLoading}
              >
                <Heart
                  size={18}
                  className="text-white"
                  fill={isInWishlist ? "white" : "none"}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Book;
