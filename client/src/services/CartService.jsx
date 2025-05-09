import api from "./api";

// Debugging helper
const logDebug = (message, data = null) => {
  console.log(`[CartService] ${message}`, data || "");
};

// Helper to check if token exists to prevent unnecessary API calls
const checkToken = () => {
  if (!api.isAuthenticated()) {
    const error = new Error("Authentication required");
    error.isAuthError = true;
    throw error;
  }
};

// Add to cart service
export const addToCart = async (bookId, quantity) => {
  logDebug("Adding to cart:", { bookId, quantity });
  checkToken(); // Verify token exists before making request

  try {
    const response = await api.post("/Cart/AddToCart", {
      bookId,
      quantity,
    });

    logDebug("Add to cart response:", response);
    return response;
  } catch (error) {
    logDebug("Add to cart error:", error);
    throw error;
  }
};

// Get my cart service
export const getMyCart = async () => {
  logDebug("Fetching cart");
  checkToken(); // Verify token exists before making request

  try {
    const response = await api.get("/Cart/GetMyCart");
    logDebug("Cart data received:", response);
    return response;
  } catch (error) {
    logDebug("Get cart error:", error);
    throw error;
  }
};

// Remove from cart service
export const removeFromCart = async (bookId) => {
  logDebug("Removing from cart:", { bookId });
  checkToken(); // Verify token exists before making request

  try {
    const response = await api.delete("/Cart/RemoveFromCart", { bookId });
    logDebug("Remove from cart response:", response);
    return response;
  } catch (error) {
    logDebug("Remove from cart error:", error);
    throw error;
  }
};

// Check if user has 10% stackable discount
export const hasStackableDiscount = () => {
  // This would normally come from the user profile or API
  // For now, we'll just check localStorage
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;

    // Parse the JWT token to get user info
    const userData = JSON.parse(atob(token.split(".")[1]));
    return userData.hasStackableDiscount || false;
  } catch (error) {
    logDebug("Error checking stackable discount:", error);
    // Return false instead of throwing to prevent crashing
    return false;
  }
};

const CartService = {
  addToCart,
  getMyCart,
  removeFromCart,
  hasStackableDiscount,
};

export default CartService;
