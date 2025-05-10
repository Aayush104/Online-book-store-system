import api from "./api";

// Debugging helper
const logDebug = (message, data = null) => {
  console.log(`[OrderService] ${message}`, data || "");
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

// Place an order with items in cart
export const placeOrder = async (cartItems) => {
  logDebug("Placing order", cartItems);
  checkToken();

  try {
    // Transform cart items to the expected format
    const orderItems = cartItems.map((item) => ({
      bookId: item.bookId,
      quantity: item.quantity,
      unitPrice: item.price,
    }));

    // Create the request payload according to the API schema
    const orderData = {
      items: orderItems,
    };

    const response = await api.post("/Orders/PlaceOrder", orderData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    logDebug("Place order response:", response);
    return response;
  } catch (error) {
    logDebug("Place order error:", error);
    throw error;
  }
};

// Get all pending orders (Staff/Admin)
export const getAllPendingOrders = async () => {
  logDebug("Fetching all pending orders");
  checkToken();

  try {
    const response = await api.get("/Orders/GetAllPendingOrders");
    logDebug("Pending orders received:", response);
    return response;
  } catch (error) {
    logDebug("Get pending orders error:", error);
    throw error;
  }
};

// Get all completed orders (Staff/Admin)
export const getAllCompletedOrders = async () => {
  logDebug("Fetching all completed orders");
  checkToken();

  try {
    const response = await api.get("/Orders/GetAllCompletedOrders");
    logDebug("Completed orders received:", response);
    return response;
  } catch (error) {
    logDebug("Get completed orders error:", error);
    throw error;
  }
};

// Get order details by ID
export const getOrderById = async (orderId) => {
  logDebug("Fetching order details by ID:", { orderId });
  checkToken();

  try {
    const response = await api.get(`/Orders/GetOrderById`);
    logDebug("Order details received:", response);
    return response;
  } catch (error) {
    logDebug("Get order details error:", error);
    throw error;
  }
};

// Get order by claim code
export const getOrderByClaimCode = async (claimCode) => {
  logDebug("Fetching order by claim code:", { claimCode });
  checkToken();

  try {
    const response = await api.get(`/Orders/GetOrderbyClaimCode/${claimCode}`);
    logDebug("Order by claim code received:", response);
    return response;
  } catch (error) {
    logDebug("Get order by claim code error:", error);
    throw error;
  }
};

// Cancel an order
export const cancelOrder = async (orderId) => {
  logDebug("Cancelling order:", { orderId });
  checkToken();

  try {
    const response = await api.put(`/Orders/CancelOrder/${orderId}`);
    logDebug("Cancel order response:", response);
    return response;
  } catch (error) {
    logDebug("Cancel order error:", error);
    throw error;
  }
};

// Complete order by claim code (Staff)
export const completeOrderByClaimCode = async (claimCode) => {
  logDebug("Completing order with claim code:", { claimCode });
  checkToken();

  try {
    // From your API screenshot, it looks like a POST with a JSON body
    const response = await api.post(
      `/Orders/CompleteOrderByClaimCode`,
      {
        claimCode: claimCode,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    logDebug("Complete order response:", response);
    return response;
  } catch (error) {
    logDebug("Complete order error:", error);
    throw error;
  }
};

// Get order notifications (real-time updates)
export const getOrderNotification = async () => {
  logDebug("Fetching order notifications");
  checkToken();

  try {
    const response = await api.get("/Orders/GetOrderNotification");
    logDebug("Order notifications received:", response);
    return response;
  } catch (error) {
    logDebug("Get order notifications error:", error);
    throw error;
  }
};

// Get user's orders
export const getMyOrders = async () => {
  logDebug("Fetching user orders");
  checkToken();

  try {
    const response = await api.get("/Orders/GetMyOrders");
    logDebug("User orders received:", response);
    return response;
  } catch (error) {
    logDebug("Get user orders error:", error);
    throw error;
  }
};

const OrderService = {
  placeOrder,
  getAllPendingOrders,
  getAllCompletedOrders,
  getOrderById,
  getOrderByClaimCode,
  cancelOrder,
  completeOrderByClaimCode,
  getOrderNotification,
  getMyOrders,
};

export default OrderService;
