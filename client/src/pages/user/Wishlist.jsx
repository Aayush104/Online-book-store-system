import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import WishlistService from "../../services/WishlistService";
import { useToast } from "../../components/Toast";
import {
  TrashIcon,
  ShoppingCartIcon,
  BookOpenIcon,
  ArrowLeftIcon,
  CalendarIcon,
  DocumentTextIcon,
  LanguageIcon,
  TagIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import CartService from "../../services/CartService";

const Wishlist = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Initialize local state
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState({});

  useEffect(() => {
    // Fetch wishlist items when component mounts
    const fetchWishlist = async () => {
      try {
        setIsLoading(true);
        const response = await WishlistService.getMyWishlist();

        if (response.isSuccess && response.data) {
          console.log("Wishlist data:", response.data);
          setItems(response.data || []);
        } else {
          throw new Error(response.message || "Failed to load wishlist");
        }
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
        setItems([]);
        setError(
          error.message || "Failed to load your wishlist. Please try again."
        );

        // Only redirect on 401 errors
        if (error.response?.status === 401 || error.isAuthError) {
          navigate("/login", {
            state: { message: "Please log in again to view your wishlist" },
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [navigate]);

  const handleRemoveItem = async (bookId) => {
    try {
      const response = await WishlistService.removeFromWishlist(bookId);

      if (response.isSuccess) {
        // Update local state after successful removal
        setItems(items.filter((item) => item.bookId !== bookId));
        showToast({
          type: "success",
          title: "Item Removed",
          message: "Book has been removed from your wishlist",
          duration: 3000,
        });
      } else {
        throw new Error(response.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to remove item from wishlist",
        duration: 4000,
      });
    }
  };

  const handleAddToCart = async (bookId) => {
    setCartLoading((prev) => ({ ...prev, [bookId]: true }));
    try {
      const response = await CartService.addToCart(bookId, 1);

      if (response.isSuccess) {
        showToast({
          type: "success",
          title: "Added to Cart",
          message: "Book has been added to your cart",
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
        message: error.message || "Failed to add item to cart",
        duration: 4000,
      });
    } finally {
      setCartLoading((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  // Format publication date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Extract year from publication date
  const extractYear = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.getFullYear();
  };

  return (
    <div className="min-h-screen bg-[var(--background)] w-full">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)]">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex items-center text-sm py-2">
            <Link to="/" className="text-primary-600 hover:text-primary-500">
              Home
            </Link>
            <span className="mx-2 text-[var(--text-secondary)]">/</span>
            <span className="text-[var(--text-secondary)]">Wishlist</span>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Your Wishlist
          </h1>
          <Link
            to="/user/books"
            className="inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to shopping
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800 text-red-100 p-6 rounded-md mb-6">
            <p className="text-lg font-medium mb-2">Something went wrong</p>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : items?.length === 0 ? (
          <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-8 text-center">
            <div className="flex justify-center mb-4">
              <BookOpenIcon className="h-16 w-16 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">
              Your wishlist is empty
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Browse our collection and bookmark your favorite books!
            </p>
            <button
              onClick={() => navigate("/user/books")}
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {items.map((book) => (
              <div
                key={book.bookId}
                className="bg-[var(--surface)] rounded-lg overflow-hidden border border-[var(--border)] hover:border-primary-500/50 transition-colors shadow-sm"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Book Cover */}
                  <div className="md:w-1/3 relative">
                    <Link to={`/book/${book.bookId}`} className="block h-full">
                      <div className="aspect-[3/4] bg-[#1a2235] relative overflow-hidden">
                        {book.bookPhoto ? (
                          <img
                            src={book.bookPhoto}
                            alt={book.bookTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
                            <BookOpenIcon className="h-20 w-20" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={() => handleRemoveItem(book.bookId)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Book Details */}
                  <div className="md:w-2/3 p-6 flex flex-col">
                    <Link
                      to={`/book/${book.bookId}`}
                      className="block mb-1 hover:text-primary-500 transition-colors"
                    >
                      <h3 className="text-xl font-bold text-[var(--text-primary)]">
                        {book.bookTitle}
                      </h3>
                    </Link>

                    <p className="text-primary-500 font-medium mb-3">
                      {book.bookAuthor}
                    </p>

                    {book.description && (
                      <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">
                        {book.description}
                      </p>
                    )}

                    {/* Book Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                      {book.genre && (
                        <div className="flex items-center text-[var(--text-secondary)]">
                          <TagIcon className="h-4 w-4 mr-2 text-primary-500" />
                          <span>{book.genre}</span>
                        </div>
                      )}

                      {book.language && (
                        <div className="flex items-center text-[var(--text-secondary)]">
                          <LanguageIcon className="h-4 w-4 mr-2 text-primary-500" />
                          <span>{book.language}</span>
                        </div>
                      )}

                      {book.isbn && (
                        <div className="flex items-center text-[var(--text-secondary)]">
                          <IdentificationIcon className="h-4 w-4 mr-2 text-primary-500" />
                          <span>ISBN: {book.isbn}</span>
                        </div>
                      )}

                      {book.publicationDate && (
                        <div className="flex items-center text-[var(--text-secondary)]">
                          <CalendarIcon className="h-4 w-4 mr-2 text-primary-500" />
                          <span>{extractYear(book.publicationDate)}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags/Labels */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {book.stock > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-green-600/20 text-green-500">
                          In Stock ({book.stock})
                        </span>
                      )}

                      {/* You can add more tags here based on book properties */}
                    </div>

                    {/* Actions Row */}
                    <div className="mt-auto flex justify-between items-center">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        ${(book.price || 0).toFixed(2)}
                      </div>

                      <button
                        onClick={() => handleAddToCart(book.bookId)}
                        disabled={cartLoading[book.bookId]}
                        className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md flex items-center transition-colors disabled:opacity-70"
                      >
                        {cartLoading[book.bookId] ? (
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
                            <ShoppingCartIcon className="h-5 w-5 mr-2" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
