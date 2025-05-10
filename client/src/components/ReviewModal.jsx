import React, { useState } from "react";
import { XMarkIcon, StarIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import ReviewService from "../services/ReviewService";

const ReviewModal = ({ book, isOpen, onClose, onReviewSubmitted }) => {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reviewText.trim()) {
      setError("Please enter a review comment");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await ReviewService.submitReview(book.id, reviewText);

      if (response && response.isSuccess) {
        onReviewSubmitted();
      } else {
        setError(
          response?.message || "Failed to submit review. Please try again."
        );
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating) => {
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative transform overflow-hidden rounded-lg bg-[var(--surface)] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-[var(--border)]">
          {/* Modal header */}
          <div className="px-4 py-3 sm:px-6 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              Write a Review
            </h3>
            <button
              type="button"
              className="rounded-md p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Modal content */}
          <div className="px-4 pt-5 pb-4 sm:p-6">
            {/* Book info */}
            <div className="flex items-center mb-4">
              <div className="h-16 w-12 bg-neutral-100 dark:bg-neutral-700 rounded mr-3 flex-shrink-0 overflow-hidden">
                {book.image ? (
                  <img
                    src={book.image}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <BookOpenIcon className="h-6 w-6 text-[var(--text-tertiary)]" />
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium text-[var(--text-primary)]">
                  {book.title}
                </h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  {book.author}
                </p>
              </div>
            </div>

            {/* Rating stars */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Rating
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                    className="p-1 focus:outline-none"
                  >
                    {(hoveredRating || rating) >= star ? (
                      <StarSolidIcon className="h-6 w-6 text-warning-500" />
                    ) : (
                      <StarIcon className="h-6 w-6 text-[var(--text-tertiary)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Review text area */}
            <div className="mb-4">
              <label
                htmlFor="review-text"
                className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
              >
                Your Review
              </label>
              <textarea
                id="review-text"
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this book..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              ></textarea>
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                Your review will help other readers make better choices.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 rounded-lg border border-error-200 dark:border-error-800">
                <p className="text-sm text-error-800 dark:text-error-300">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Modal footer */}
          <div className="px-4 py-3 sm:px-6 flex flex-row-reverse gap-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !reviewText.trim()}
              className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
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
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] py-2 px-4 text-sm font-medium text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-hover)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
