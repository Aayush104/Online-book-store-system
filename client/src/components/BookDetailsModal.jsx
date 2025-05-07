import React from "react";
import { format } from "date-fns";
import {
  FiX,
  FiBook,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiTag,
  FiGlobe,
  FiBookmark,
  FiPackage,
  FiShoppingCart,
  FiHeart,
  FiInfo,
  FiCheck,
  FiStar,
  FiHome,
} from "react-icons/fi";

const BookDetailsModal = ({
  isOpen,
  onClose,
  book,
  onAddToCart,
  onAddToWishlist,
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

  const activeDiscount = isDiscountActive();
  const discountedPrice = calculateDiscountedPrice();

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 dark:bg-black dark:bg-opacity-80 z-50 flex justify-center items-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="relative">
          {/* Header with close button */}
          <div className="absolute top-0 right-0 p-4 z-10">
            <button
              onClick={onClose}
              className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="Close"
            >
              <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Book Content */}
          <div className="flex flex-col lg:flex-row">
            {/* Book Cover */}
            <div className="lg:w-1/3 p-6 flex justify-center bg-gray-100 dark:bg-gray-700">
              <div className="relative">
                <div className="w-full h-80 lg:h-96 shadow-lg rounded-lg overflow-hidden">
                  {book.bookPhoto ? (
                    <img
                      src={book.bookPhoto}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <FiBook className="text-gray-400 text-6xl" />
                    </div>
                  )}
                </div>

                {/* Discount Badge */}
                {activeDiscount && (
                  <div className="absolute -top-3 -right-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md transform rotate-12">
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
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {book.title}
                </h2>
                <div className="flex items-center mt-1 text-gray-600 dark:text-gray-300">
                  <FiUser className="mr-1" />
                  <span className="font-medium">{book.author}</span>
                </div>
              </div>

              {/* Price Section */}
              <div className="mb-6 bg-indigo-50 dark:bg-indigo-900 p-4 rounded-lg">
                <div className="flex items-center">
                  <FiDollarSign className="text-indigo-600 dark:text-indigo-400 mr-2" />
                  <div>
                    {activeDiscount ? (
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          ${discountedPrice}
                        </span>
                        <span className="ml-2 text-gray-500 line-through dark:text-gray-400">
                          ${book.price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        ${book.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Availability */}
                <div className="mt-2 flex items-center">
                  {book.stock > 0 ? (
                    <div className="text-green-600 dark:text-green-400 flex items-center">
                      <FiCheck className="mr-1" />
                      <span>In Stock ({book.stock} available)</span>
                    </div>
                  ) : (
                    <div className="text-red-600 dark:text-red-400">
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {book.stock > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => onAddToCart && onAddToCart(book.bookId)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-full flex items-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                    >
                      <FiShoppingCart className="mr-2" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() =>
                        onAddToWishlist && onAddToWishlist(book.bookId)
                      }
                      className="bg-white hover:bg-gray-100 text-indigo-600 border border-indigo-600 py-2 px-4 rounded-full flex items-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-indigo-400 dark:border-indigo-400"
                    >
                      <FiHeart className="mr-2" />
                      Add to Wishlist
                    </button>
                  </div>
                )}
              </div>

              {/* Book Information Sections */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
                    <FiInfo className="mr-2 text-indigo-600 dark:text-indigo-400" />
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {book.description}
                  </p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Book Details
                    </h3>

                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <div className="text-gray-500 dark:text-gray-400 flex items-center">
                        <FiBookmark className="mr-2 text-indigo-600 dark:text-indigo-400" />
                        ISBN:
                      </div>
                      <div className="text-gray-700 dark:text-gray-200">
                        {book.isbn}
                      </div>

                      <div className="text-gray-500 dark:text-gray-400 flex items-center">
                        <FiTag className="mr-2 text-indigo-600 dark:text-indigo-400" />
                        Genre:
                      </div>
                      <div className="text-gray-700 dark:text-gray-200">
                        {book.genre}
                      </div>

                      <div className="text-gray-500 dark:text-gray-400 flex items-center">
                        <FiGlobe className="mr-2 text-indigo-600 dark:text-indigo-400" />
                        Language:
                      </div>
                      <div className="text-gray-700 dark:text-gray-200">
                        {book.language}
                      </div>

                      <div className="text-gray-500 dark:text-gray-400 flex items-center">
                        <FiPackage className="mr-2 text-indigo-600 dark:text-indigo-400" />
                        Format:
                      </div>
                      <div className="text-gray-700 dark:text-gray-200">
                        {book.format}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Publication
                    </h3>

                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <div className="text-gray-500 dark:text-gray-400 flex items-center">
                        <FiUser className="mr-2 text-indigo-600 dark:text-indigo-400" />
                        Publisher:
                      </div>
                      <div className="text-gray-700 dark:text-gray-200">
                        {book.publisher}
                      </div>

                      <div className="text-gray-500 dark:text-gray-400 flex items-center">
                        <FiCalendar className="mr-2 text-indigo-600 dark:text-indigo-400" />
                        Published:
                      </div>
                      <div className="text-gray-700 dark:text-gray-200">
                        {displayDate(book.publicationDate)}
                      </div>

                      <div className="text-gray-500 dark:text-gray-400 flex items-center">
                        <FiBook className="mr-2 text-indigo-600 dark:text-indigo-400" />
                        Added:
                      </div>
                      <div className="text-gray-700 dark:text-gray-200">
                        {displayDate(book.addedDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {book.isAvailableInLibrary && (
                      <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm dark:bg-green-900 dark:text-green-200">
                        <FiHome className="mr-1" />
                        Available in Library
                      </div>
                    )}

                    {activeDiscount && (
                      <div className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm dark:bg-red-900 dark:text-red-200">
                        <FiStar className="mr-1" />
                        Sale: {displayDate(book.discountStartDate)} -{" "}
                        {displayDate(book.discountEndDate)}
                      </div>
                    )}

                    {book.exclusiveEdition && (
                      <div className="inline-flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm dark:bg-amber-900 dark:text-amber-200">
                        <FiBookmark className="mr-1" />
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
