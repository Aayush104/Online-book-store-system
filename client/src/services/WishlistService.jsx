import api from "./api";

// Debugging helper
const logDebug = (message, data = null) => {
  console.log(`[WishlistService] ${message}`, data || "");
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

// Add to wishlist service
export const addToWishlist = async (bookId) => {
  logDebug("Adding to wishlist:", { bookId });
  checkToken(); // Verify token exists before making request

  try {
    const response = await api.post(`/Wishlist/AddToBookMark/${bookId}`);
    logDebug("Add to wishlist response:", response);
    return response;
  } catch (error) {
    logDebug("Add to wishlist error:", error);
    throw error;
  }
};

// Get my wishlist service
export const getMyWishlist = async () => {
  logDebug("Fetching wishlist");
  checkToken(); // Verify token exists before making request

  try {
    const response = await api.get("/Wishlist/GetBookMark");
    logDebug("Wishlist data received:", response);
    return response;
  } catch (error) {
    logDebug("Get wishlist error:", error);
    throw error;
  }
};

// Remove from wishlist service
export const removeFromWishlist = async (bookId) => {
  logDebug("Removing from wishlist:", { bookId });
  checkToken(); // Verify token exists before making request

  try {
    const response = await api.delete(`/Wishlist/RemoveBookMark/${bookId}`);
    logDebug("Remove from wishlist response:", response);
    return response;
  } catch (error) {
    logDebug("Remove from wishlist error:", error);
    throw error;
  }
};

// Check if book is in wishlist
export const isBookInWishlist = async (bookId) => {
  try {
    const response = await getMyWishlist();
    if (response.isSuccess && response.data && response.data) {
      return response.data.some((item) => item.bookId === bookId);
    }
    return false;
  } catch (error) {
    logDebug("Check if book in wishlist error:", error);
    return false;
  }
};

// Get wishlist count
export const getWishlistCount = async () => {
  try {
    const response = await getMyWishlist();
    if (response.isSuccess && response.data && response.data.items) {
      return response.data.length;
    }
    return 0;
  } catch (error) {
    logDebug("Get wishlist count error:", error);
    return 0;
  }
};

const WishlistService = {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
  isBookInWishlist,
  getWishlistCount,
};

export default WishlistService;
