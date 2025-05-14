import api from "./api";

// Fetch cart and wishlist count
export const getCartsAndWishlistCount = async () => {
  try {
    const response = await api.get("/AdminBook/CartsAndWishlistCount");
    console.log(response);
    if (response) {
      return response;
    } else {
      // If the response indicates failure, throw with the message
      const errorMessage =
        response.message || "Failed to fetch cart and wishlist count";
      throw new Error(errorMessage);
    }
  } catch (error) {
    // Handle different types of errors
    let errorMessage = "Failed to fetch cart and wishlist count";

    if (error.response) {
      // The server responded with an error status
      errorMessage =
        error.response.data?.message || error.response.data || errorMessage;
    } else if (error.message) {
      // Network error or custom error
      errorMessage = error.message;
    }

    console.error(errorMessage);
    throw error;
  }
};

// Fetch admin dashboard stats
export const getAdminDashboardStats = async () => {
  try {
    const response = await api.get("/AdminBook/AdminDashboardStats");
    console.log(response);
    if (response.isSuccess && response) {
      return response;
    } else {
      // If the response indicates failure, throw with the message
      const errorMessage =
        response.message || "Failed to fetch dashboard stats";
      throw new Error(errorMessage);
    }
  } catch (error) {
    let errorMessage = "Failed to fetch dashboard stats";

    if (error.response) {
      // The server responded with an error status
      errorMessage =
        error.response.data?.message || error.response.data || errorMessage;
    } else if (error.message) {
      // Network error or custom error
      errorMessage = error.message;
    }

    console.error(errorMessage);
    throw error;
  }
};

const StatsService = {
  getCartsAndWishlistCount,
  getAdminDashboardStats,
};

export default StatsService;
