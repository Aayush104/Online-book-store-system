import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  X,
  Book,
  DollarSign,
  Calendar,
  User,
  Tag,
  Globe,
  Bookmark,
  Package,
  ShoppingCart,
  Heart,
  Info,
  Check,
  Star,
  Home,
  CreditCard,
} from "lucide-react";

const BookDetailsModal = ({
  isOpen,
  onClose,
  book,
  onAddToCart,
  onAddToWishlist,
  onBuyNow,
}) => {
  if (!isOpen || !book) return null;

  const calculateDiscountedPrice = () => {
    if (book.onSale && book.discountPercentage > 0) {
      const discountAmount = (book.price * book.discountPercentage) / 100;
      return (book.price - discountAmount).toFixed(2);
    }
    return book.price.toFixed(2);
  };

  const isDiscountActive = () => {
    if (!book.onSale || !book.discountStartDate || !book.discountEndDate)
      return false;

    const now = new Date();
    const startDate = new Date(book.discountStartDate);
    const endDate = new Date(book.discountEndDate);

    return now >= startDate && now <= endDate;
  };

  const displayDate = (date) => {
    if (!date) return "";
    try {
      return format(new Date(date), "MMMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          // Decode the token to get user role
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUserRole(payload.Role || null);
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem("token");
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const activeDiscount = isDiscountActive();
  const discountedPrice = calculateDiscountedPrice();

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex justify-center items-center p-4 overflow-y-auto">
      <div className="bg-[var(--surface)] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-[var(--border)]">
        <div className="relative">
          {/* Header with close button */}
          <div className="absolute top-0 right-0 p-4 z-10">
            <button
              onClick={onClose}
              className="bg-[var(--surface)] rounded-full p-2 shadow-md hover:bg-[var(--background)] focus:outline-none transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>

          {/* Book Content */}
          <div className="flex flex-col lg:flex-row">
            {/* Book Cover */}
            <div className="lg:w-1/3 p-6 flex justify-center bg-[var(--background)]">
              <div className="relative">
                <div className="w-full h-80 lg:h-96 shadow-lg rounded-lg overflow-hidden">
                  {book.bookPhoto ? (
                    <img
                      src={book.bookPhoto}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--background)] flex items-center justify-center">
                      <Book className="text-[var(--text-secondary)] text-6xl" />
                    </div>
                  )}
                </div>

                {/* Discount Badge */}
                {activeDiscount && (
                  <div className="absolute -top-3 -right-3 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md transform rotate-12">
                    {book.discountPercentage}% OFF
                  </div>
                )}

                {/* Exclusive Edition Badge */}
                {book.exclusiveEdition && (
                  <div className="absolute -top-3 -left-3 bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md transform -rotate-12">
                    {book.exclusiveEdition}
                  </div>
                )}
              </div>
            </div>

            {/* Book Details */}
            <div className="lg:w-2/3 p-6 overflow-y-auto">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  {book.title}
                </h2>
                <div className="flex items-center mt-1 text-[var(--text-secondary)]">
                  <User className="mr-1" size={16} />
                  <span className="font-medium">{book.author}</span>
                </div>
              </div>

              {/* Price Section */}
              <div className="mb-6 bg-indigo-100 dark:bg-indigo-900/20 p-4 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="text-[#a48ce7] mr-2" size={20} />
                  <div>
                    {activeDiscount ? (
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-[#a48ce7]">
                          ${discountedPrice}
                        </span>
                        <span className="ml-2 text-[var(--text-secondary)] line-through">
                          ${book.price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-[#a48ce7]">
                        ${book.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Availability */}
                <div className="mt-2 flex items-center">
                  {book.stock > 0 ? (
                    <div className="text-green-500 flex items-center">
                      <Check className="mr-1" size={16} />
                      <span>In Stock ({book.stock} available)</span>
                    </div>
                  ) : (
                    <div className="text-red-500 flex items-center">
                      <X className="mr-1" size={16} />
                      <span>Out of Stock</span>
                    </div>
                  )}
                </div>

                {book.stock > 0 && userRole !== "Admin" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {userRole === "PublicUser" ? (
                      // Regular customer buttons
                      <>
                        <button
                          onClick={() => onAddToCart?.(book.bookId)}
                          className="bg-[#a48ce7] hover:bg-[#9370db] text-white py-2 px-4 rounded-full flex items-center transition-colors duration-200"
                        >
                          <ShoppingCart className="mr-2" size={16} />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => onBuyNow?.(book.bookId)}
                          className="bg-[#8ed1a8] hover:bg-[#7bc093] text-white py-2 px-4 rounded-full flex items-center transition-colors duration-200"
                        >
                          <CreditCard className="mr-2" size={16} />
                          Buy Now
                        </button>
                        <button
                          onClick={() => onAddToWishlist?.(book.bookId)}
                          className="bg-[var(--surface)] hover:bg-[var(--background)] text-[#f87171] border border-[#f87171] py-2 px-4 rounded-full flex items-center transition-colors duration-200"
                        >
                          <Heart
                            className="mr-2"
                            size={16}
                            fill={book.isInWishlist ? "#f87171" : "none"}
                          />
                          Add to Wishlist
                        </button>
                      </>
                    ) : (
                      // Guest buttons (when userRole is null/undefined or any other non-customer role)
                      <></>
                    )}
                  </div>
                )}
              </div>

              {/* Book Information Sections */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 flex items-center">
                    <Info className="mr-2 text-[#a48ce7]" size={18} />
                    Description
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {book.description}
                  </p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                      Book Details
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-28 flex-shrink-0 text-[#a48ce7] flex items-center">
                          <Bookmark className="mr-2" size={16} />
                          ISBN:
                        </div>
                        <div className="text-[var(--text-primary)] truncate">
                          {book.isbn || "Dignissimos molestia"}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-28 flex-shrink-0 text-[#a48ce7] flex items-center">
                          <Tag className="mr-2" size={16} />
                          Genre:
                        </div>
                        <div className="text-[var(--text-primary)] truncate">
                          {book.genre || "Southern Gothic"}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-28 flex-shrink-0 text-[#a48ce7] flex items-center">
                          <Globe className="mr-2" size={16} />
                          Language:
                        </div>
                        <div className="text-[var(--text-primary)] truncate">
                          {book.language || "English"}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-28 flex-shrink-0 text-[#a48ce7] flex items-center">
                          <Package className="mr-2" size={16} />
                          Format:
                        </div>
                        <div className="text-[var(--text-primary)] truncate">
                          {book.format || "First"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                      Publication
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-28 flex-shrink-0 text-[#a48ce7] flex items-center">
                          <User className="mr-2" size={16} />
                          Publisher:
                        </div>
                        <div className="text-[var(--text-primary)] truncate">
                          {book.publisher || "J. B. Lippincott & Co."}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-28 flex-shrink-0 text-[#a48ce7] flex items-center">
                          <Calendar className="mr-2" size={16} />
                          Published:
                        </div>
                        <div className="text-[var(--text-primary)] truncate">
                          {displayDate(book.publicationDate) || "July 12, 2021"}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-28 flex-shrink-0 text-[#a48ce7] flex items-center">
                          <Book className="mr-2" size={16} />
                          Added:
                        </div>
                        <div className="text-[var(--text-primary)] truncate">
                          {displayDate(book.addedDate) || "May 12, 2025"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="pt-4 border-t border-[var(--border)]">
                  <div className="flex flex-wrap gap-2">
                    {book.isAvailableInLibrary && (
                      <div className="inline-flex items-center bg-[#8ed1a8]/20 text-[#8ed1a8] dark:text-[#8ed1a8] px-3 py-1 rounded-full text-sm border border-[#8ed1a8]">
                        <Home className="mr-1" size={14} />
                        Available in Library
                      </div>
                    )}

                    {activeDiscount && (
                      <div className="inline-flex items-center bg-[#f87171]/20 text-[#f87171] dark:text-[#f87171] px-3 py-1 rounded-full text-sm border border-[#f87171]">
                        <Star className="mr-1" size={14} />
                        Sale: {displayDate(book.discountStartDate)} -{" "}
                        {displayDate(book.discountEndDate)}
                      </div>
                    )}

                    {book.exclusiveEdition && (
                      <div className="inline-flex items-center bg-[#f8b84e]/20 text-[#f8b84e] dark:text-[#f8b84e] px-3 py-1 rounded-full text-sm border border-[#f8b84e]">
                        <Bookmark className="mr-1" size={14} />
                        {book.exclusiveEdition} Edition
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;
