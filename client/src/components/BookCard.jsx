import React, { useState } from "react";
import {
  EyeIcon,
  ShoppingCartIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";

const BookCard = ({ book, onViewDetails, onAddToCart, showLoginPrompt }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Calculate discounted price
  const discountedPrice = book.discountPercentage
    ? book.price * (1 - book.discountPercentage / 100)
    : book.price;

  // Render stars
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <StarIconSolid
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (showLoginPrompt) {
      showLoginPrompt("like books");
      return;
    }
    setIsLiked(!isLiked);
  };

  return (
    <div
      className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 dark:border-neutral-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Book Cover */}
      <div className="relative aspect-[3/4] bg-gray-100 dark:bg-neutral-700">
        <img
          src={book.bookPhoto}
          alt={book.title}
          className="w-full h-full object-cover"
        />

        {/* Discount Badge */}
        {book.discountPercentage && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold z-10">
            {book.discountPercentage}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleLikeClick}
          className="absolute top-3 right-3 p-2 bg-white dark:bg-neutral-800 rounded-full shadow-md hover:shadow-lg transition-all duration-200 z-20"
        >
          {isLiked ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Stock Status - Inside Image */}
        {book.stock !== undefined && (
          <div className="absolute bottom-3 left-3 z-10">
            <span
              className={`text-xs px-2 py-1 rounded-md font-medium ${
                book.stock > 0
                  ? "bg-emerald-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {book.stock > 0
                ? book.stock < 10
                  ? `Only ${book.stock} left`
                  : "In Stock"
                : "Out of Stock"}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200 z-10">
            <button
              onClick={() => onViewDetails?.(book)}
              className="bg-white text-gray-900 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <EyeIcon className="h-4 w-4" />
              View Details
            </button>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1 line-clamp-1">
          {book.title}
        </h3>

        {/* Author */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          by {book.author}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">{renderStars(book.rating)}</div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ({book.reviewCount})
          </span>
        </div>

        {/* Bottom Row - Price and Cart */}
        <div className="flex items-end justify-between">
          {/* Empty space on left */}
          <div></div>

          {/* Price and Cart Button on right */}
          <div className="text-right">
            {/* Price */}
            {book.discountPercentage ? (
              <div className="mb-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ${discountedPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 line-through ml-1">
                  ${book.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="mb-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ${book.price.toFixed(2)}
                </span>
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={() => showLoginPrompt?.("add to cart")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
              aria-label="Add to cart"
            >
              <ShoppingCartIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
