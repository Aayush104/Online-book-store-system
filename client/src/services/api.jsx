import axios from "axios";

// Base URL for all API calls - uses environment variable if available, otherwise defaults to localhost
const API_BASE_URL = "https://localhost:7219/api";

// Create a reusable instance of axios with our base URL
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

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
      // The server responded with a status code outside 2xx range
      console.log("API Error Response:", error.response);

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

      // Create a custom error object with all the information we need
      const enhancedError = new Error(errorMessage);
      enhancedError.response = error.response;
      enhancedError.status = error.response.status;

      // Return the enhanced error
      return Promise.reject(enhancedError);
    } else if (error.request) {
      // Request was made but no response was received
      console.log("No response received:", error.request);

      const networkError = new Error(
        "Network error. Please check your connection."
      );
      networkError.request = error.request;

      return Promise.reject(networkError);
    } else {
      // Something happened in setting up the request
      console.log("Request setup error:", error.message);

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
      .then((response) => response.data); // Extract just the data from response
  },

  // POST - Send new data to server (like creating a new record)
  post: (endpoint, data) => {
    return axiosInstance.post(endpoint, data).then((response) => response.data);
  },

  // PUT - Update existing data on server
  put: (endpoint, data) => {
    return axiosInstance.put(endpoint, data).then((response) => response.data);
  },

  // DELETE - Remove data from server
  delete: (endpoint) => {
    return axiosInstance.delete(endpoint).then((response) => response.data);
  },

  // POST with files - Send data that includes files (like images)
  postWithFile: (endpoint, data) => {
    // Create special form data object for files
    const formData = new FormData();

    // Go through each piece of data
    Object.keys(data).forEach((key) => {
      // If it's a file, add it as a file
      if (data[key] instanceof File) {
        formData.append(key, data[key]);
      }
      // If it's an array (multiple items), add each item
      else if (Array.isArray(data[key])) {
        data[key].forEach((item) => {
          formData.append(key, item);
        });
      }
      // If it's regular data (not null/undefined), add it normally
      else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    // Send the request with special headers for files
    return axiosInstance
      .post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  },

  // PUT with files - Update data that includes files
  putWithFile: (endpoint, data) => {
    // Create special form data object for files
    const formData = new FormData();

    // Go through each piece of data (same as postWithFile)
    Object.keys(data).forEach((key) => {
      // If it's a file, add it as a file
      if (data[key] instanceof File) {
        formData.append(key, data[key]);
      }
      // If it's an array (multiple items), add each item
      else if (Array.isArray(data[key])) {
        data[key].forEach((item) => {
          formData.append(key, item);
        });
      }
      // If it's regular data (not null/undefined), add it normally
      else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    // Send the request with special headers for files
    return axiosInstance
      .put(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  },
};

// Make the api object available for use in other files
export default api;
