import api from "./api";

// Debugging helper
const logDebug = (message, data = null) => {
  console.log(`[ReviewService] ${message}`, data || "");
};

// Helper to check if token exists to prevent unnecessary API calls
const checkToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    const error = new Error("Authentication required");
    error.isAuthError = true;
    throw error;
  }
};

/**
 * Check if a user is eligible to review a specific book
 * @param {string} bookId - The encrypted book ID
 * @returns {Promise} - The API response
 */
export const checkReviewEligibility = async (bookId) => {
  logDebug("Checking review eligibility for book", bookId);
  checkToken();

  try {
    const response = await api.get(
      `/Reviews/CheckEligibilityForReview/${bookId}`
    );
    logDebug("Eligibility check response:", response);
    return response;
  } catch (error) {
    logDebug("Eligibility check error:", error);
    throw error;
  }
};

/**
 * Submit a review for a book
 * @param {string} bookId - The encrypted book ID
 * @param {string} comment - The review comment
 * @returns {Promise} - The API response
 */
export const submitReview = async (bookId, comment, rating) => {
  try {
    // Create the request payload
    const reviewData = {
      BookId: bookId,
      Comment: comment,
      Star: rating,
    };

    const response = await api.post("/Reviews/DoReview", reviewData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    logDebug("Review submission response:", response);
    return response;
  } catch (error) {
    logDebug("Review submission error:", error);
    throw error;
  }
};

/**
 * Get all reviews for a specific book
 * @param {string} bookId - The encrypted book ID
 * @returns {Promise} - The API response containing reviews
 */
export const getBookReviews = async (bookId) => {
  logDebug("Fetching reviews for book", bookId);

  try {
    const response = await api.get(`/Reviews/GetReview/${bookId}`);
    logDebug("Book reviews response:", response);
    return response;
  } catch (error) {
    logDebug("Get book reviews error:", error);
    throw error;
  }
};

/**
 * Delete a review by its ID
 * @param {number} reviewId - The review ID to delete
 * @returns {Promise} - The API response
 */
export const deleteReview = async (reviewId) => {
  logDebug("Deleting review", reviewId);
  checkToken();

  try {
    const response = await api.delete(`/Reviews/DeleteReview/${reviewId}`);
    logDebug("Delete review response:", response);
    return response;
  } catch (error) {
    logDebug("Delete review error:", error);
    throw error;
  }
};

// Wrap all functions in a single service object
const ReviewService = {
  checkReviewEligibility,
  submitReview,
  getBookReviews,
  deleteReview,
};

export default ReviewService;
