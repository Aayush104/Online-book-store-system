// api.js - Improved version with fixes for token persistence
import axios from "axios";

// Base URL for all API calls
const API_BASE_URL = "https://localhost:7219/api";

// Create a reusable instance of axios with our base URL
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Flag to track if we've already logged an auth error
let authErrorLogged = false;

// Request Interceptor - Adds authentication token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from browser's local storage
    const token = localStorage.getItem("token");

    // If user is logged in (token exists), add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // If something goes wrong before request is sent, pass the error along
    return Promise.reject(error);
  }
);

// Response Interceptor - Handles all API responses and errors
axiosInstance.interceptors.response.use(
  // For successful responses, just pass them through
  (response) => response,

  // For errors, extract the error message and format it consistently
  (error) => {
    // Check if the server actually responded with an error
    if (error.response) {
      // Extract error message from different possible locations
      let errorMessage = "An error occurred";

      if (error.response.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          // Handle validation errors from .NET API
          const errors = error.response.data.errors;
          const errorMessages = [];

          Object.keys(errors).forEach((key) => {
            if (Array.isArray(errors[key])) {
              errorMessages.push(...errors[key]);
            } else {
              errorMessages.push(errors[key]);
            }
          });

          errorMessage = errorMessages.join(", ");
        } else if (error.response.data.title) {
          // Handle .NET problem details format
          errorMessage = error.response.data.title;
        }
      }

      // Special handling for 401 Unauthorized errors
      if (error.response.status === 401) {
        // Only log once to prevent multiple alerts/redirects
        if (!authErrorLogged) {
          authErrorLogged = true;

          // IMPORTANT: Only set the auth_error flag instead of clearing localStorage
          // This prevents token from being accidentally cleared
          sessionStorage.setItem("auth_error", "true");

          // After 1 second, reset the flag to allow new auth error logs
          setTimeout(() => {
            authErrorLogged = false;
          }, 1000);
        }

        errorMessage = "Authentication error. Please log in again.";
      }

      // Create a custom error object with all the information we need
      const enhancedError = new Error(errorMessage);
      enhancedError.response = error.response;
      enhancedError.status = error.response.status;
      enhancedError.isAuthError = error.response.status === 401;

      // Return the enhanced error
      return Promise.reject(enhancedError);
    } else if (error.request) {
      // Request was made but no response was received
      const networkError = new Error(
        "Network error. Please check your connection."
      );
      networkError.request = error.request;
      networkError.isNetworkError = true;

      return Promise.reject(networkError);
    } else {
      // Something happened in setting up the request
      return Promise.reject(error);
    }
  }
);

// API METHODS - Different functions for different types of requests

const api = {
  // GET - Fetch data from server
  get: (endpoint, params = {}) => {
    return axiosInstance
      .get(endpoint, { params }) // params are added to URL as ?key=value
      .then((response) => response.data) // Extract just the data from response
      .catch((error) => {
        // Do not modify localStorage here - just propagate the error
        throw error;
      });
  },

  // POST - Send new data to server (like creating a new record)
  post: (endpoint, data) => {
    return axiosInstance
      .post(endpoint, data)
      .then((response) => response.data)
      .catch((error) => {
        throw error;
      });
  },

  // PUT - Update existing data on server
  put: (endpoint, data) => {
    return axiosInstance
      .put(endpoint, data)
      .then((response) => response.data)
      .catch((error) => {
        throw error;
      });
  },

  // DELETE - Remove data from server
  delete: (endpoint, data = null) => {
    const config = data ? { data } : {};
    return axiosInstance
      .delete(endpoint, config)
      .then((response) => response.data)
      .catch((error) => {
        throw error;
      });
  },

  // POST with files - Send data that includes files (like images)
  postWithFile: (endpoint, data) => {
    // No need to create a new FormData if it's already FormData
    if (!(data instanceof FormData)) {
      throw new Error("postWithFile expects FormData");
    }

    // Send the request with special headers for files
    return axiosInstance
      .post(endpoint, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data)
      .catch((error) => {
        throw error;
      });
  },

  // PUT with files - Update data that includes files
  putWithFile: (endpoint, data) => {
    // No need to create a new FormData if it's already FormData
    if (!(data instanceof FormData)) {
      throw new Error("putWithFile expects FormData");
    }

    // Send the request with special headers for files
    return axiosInstance
      .put(endpoint, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data)
      .catch((error) => {
        throw error;
      });
  },

  // Utility to check if the user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Clear auth error flag
  clearAuthError: () => {
    sessionStorage.removeItem("auth_error");
    authErrorLogged = false;
  },

  // Check token validity
  checkToken: () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return false;
    }

    try {
      // Get the payload part of the JWT token and check expiration
      const payload = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));

      // Check if token has expired
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedPayload.exp > currentTime;
    } catch (error) {
      // If there's any error parsing the token, consider it invalid
      return false;
    }
  },
};

// Make the api object available for use in other files
export default api;
