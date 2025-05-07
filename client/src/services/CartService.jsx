import api from "./api";
import {
  setCartItems,
  addCartItem,
  removeCartItem,
  setCartLoading,
  setCartError,
  clearCartError,
} from "../features/cartSlice";
import { store } from "../app/store";

// Debugging helper
const logDebug = (message, data = null) => {
  console.log(`[CartService] ${message}`, data || "");
};

// Add to cart service
export const addToCart = async (bookId, quantity) => {
  const { dispatch } = store;
  logDebug("Adding to cart:", { bookId, quantity });

  try {
    dispatch(setCartLoading(true));
    dispatch(clearCartError());

    const response = await api.post("/Cart/AddToCart", {
      bookId,
      quantity,
    });

    logDebug("Add to cart response:", response);

    if (response.isSuccess) {
      // Refresh cart after adding item
      await getMyCart();
      return response;
    } else {
      // If the response indicates failure, throw with the message
      const errorMessage = response.message || "Failed to add item to cart";
      dispatch(setCartError(errorMessage));
      throw new Error(errorMessage);
    }
  } catch (error) {
    // Handle different types of errors
    logDebug("Add to cart error:", error);

    let errorMessage = "Failed to add item to cart";

    if (error.response) {
      // The server responded with an error status
      errorMessage =
        error.response.data?.message || error.response.data || errorMessage;
    } else if (error.message) {
      // Network error or custom error
      errorMessage = error.message;
    }

    dispatch(setCartError(errorMessage));
    throw error;
  } finally {
    dispatch(setCartLoading(false));
  }
};

// Get my cart service
export const getMyCart = async () => {
  const { dispatch } = store;
  logDebug("Fetching cart");

  try {
    dispatch(setCartLoading(true));
    dispatch(clearCartError());

    const response = await api.get("/Cart/GetMyCart");
    logDebug("Cart data received:", response);

    if (response.isSuccess && response.data) {
      // Update cart items in Redux store
      dispatch(setCartItems(response.data));
      return response;
    } else {
      // If the response indicates failure, throw with the message
      const errorMessage = response.message || "Failed to retrieve cart";
      dispatch(setCartError(errorMessage));
      throw new Error(errorMessage);
    }
  } catch (error) {
    // Handle different types of errors
    logDebug("Get cart error:", error);

    let errorMessage = "Failed to retrieve cart";

    if (error.response) {
      // The server responded with an error status
      errorMessage =
        error.response.data?.message || error.response.data || errorMessage;
    } else if (error.message) {
      // Network error or custom error
      errorMessage = error.message;
    }

    dispatch(setCartError(errorMessage));
    throw error;
  } finally {
    dispatch(setCartLoading(false));
  }
};

// Remove from cart service
export const removeFromCart = async (bookId) => {
  const { dispatch } = store;
  logDebug("Removing from cart:", { bookId });

  try {
    dispatch(setCartLoading(true));
    dispatch(clearCartError());

    const response = await api.delete("/Cart/RemoveFromCart", {
      data: { bookId },
    });

    logDebug("Remove from cart response:", response);

    if (response.isSuccess) {
      // Refresh cart after removing item
      await getMyCart();
      return response;
    } else {
      // If the response indicates failure, throw with the message
      const errorMessage =
        response.message || "Failed to remove item from cart";
      dispatch(setCartError(errorMessage));
      throw new Error(errorMessage);
    }
  } catch (error) {
    // Handle different types of errors
    logDebug("Remove from cart error:", error);

    let errorMessage = "Failed to remove item from cart";

    if (error.response) {
      // The server responded with an error status
      errorMessage =
        error.response.data?.message || error.response.data || errorMessage;
    } else if (error.message) {
      // Network error or custom error
      errorMessage = error.message;
    }

    dispatch(setCartError(errorMessage));
    throw error;
  } finally {
    dispatch(setCartLoading(false));
  }
};

// Get cart count
export const getCartCount = () => {
  const state = store.getState();
  const count = state.cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  logDebug("Cart count:", count);
  return count;
};

// Get cart total price
export const getCartTotal = () => {
  const state = store.getState();
  const total = state.cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  logDebug("Cart total:", total);
  return total;
};

// Calculate order discount (5% for orders with 5+ books)
export const calculateOrderDiscount = () => {
  const state = store.getState();
  const totalItems = state.cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Apply 5% discount if order has 5 or more books
  if (totalItems >= 5) {
    logDebug("5% order discount applied (5+ books)");
    return 0.05;
  }

  logDebug("No order discount applied");
  return 0;
};

// Check if user has 10% stackable discount
export const hasStackableDiscount = () => {
  const state = store.getState();
  const hasDiscount = state.user.user?.hasStackableDiscount || false;
  logDebug("Has stackable discount:", hasDiscount);
  return hasDiscount;
};

// Calculate final price with all applicable discounts
export const calculateFinalPrice = () => {
  const cartTotal = getCartTotal();
  const orderDiscount = calculateOrderDiscount();
  const stackableDiscount = hasStackableDiscount() ? 0.1 : 0;

  // Apply both discounts if available
  const totalDiscount = orderDiscount + stackableDiscount;
  const discountAmount = cartTotal * totalDiscount;
  const finalPrice = cartTotal - discountAmount;

  logDebug("Final price calculation:", {
    cartTotal,
    orderDiscount,
    stackableDiscount,
    totalDiscount,
    discountAmount,
    finalPrice,
  });

  return finalPrice;
};

// Clear cart (e.g., after order completion)
export const clearCart = () => {
  const { dispatch } = store;
  logDebug("Clearing cart");
  dispatch(setCartItems([]));
};

// Initialize cart - call this during app initialization
export const initializeCart = () => {
  logDebug("Initializing cart service");
  // This function can be called when the app starts to ensure cart is ready
  return getMyCart().catch((err) => {
    logDebug("Initial cart load failed, will retry when needed", err);
    // Silently fail on initial load - will retry when navigating to cart
  });
};

const CartService = {
  addToCart,
  getMyCart,
  removeFromCart,
  getCartCount,
  getCartTotal,
  calculateOrderDiscount,
  hasStackableDiscount,
  calculateFinalPrice,
  clearCart,
  initializeCart,
};

export default CartService;
