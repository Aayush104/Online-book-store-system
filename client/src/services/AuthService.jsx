import api from "./api";
import {
  loginUser,
  logoutUser,
  setLoading,
  setError,
  clearError,
} from "../features/userSlice";
import { store } from "../app/store";

// Login service
export const login = async (email, password) => {
  const { dispatch } = store;

  try {
    dispatch(setLoading(true));
    dispatch(clearError());

    const response = await api.post("/Auth/Login", {
      email,
      password,
    });

    if (response.isSuccess && response.data) {
      // Assuming your API returns { token, user } in response.data
      const { token, user } = response.data;

      // Dispatch to Redux store (this also handles localStorage)
      dispatch(loginUser({ token, user }));

      return response;
    } else {
      // If the response indicates failure, throw with the message
      const errorMessage = response.message || "Login failed";
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    }
  } catch (error) {
    // Handle different types of errors
    let errorMessage = "Login failed";

    if (error.response) {
      // The server responded with an error status
      errorMessage =
        error.response.data?.message || error.response.data || errorMessage;
    } else if (error.message) {
      // Network error or custom error
      errorMessage = error.message;
    }

    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// Register service
export const register = async (registrationData) => {
  const { dispatch } = store;

  try {
    dispatch(setLoading(true));
    dispatch(clearError());

    const response = await api.post("/Auth/RegisterUser", registrationData);
    console.log("Registration response:", response);

    if (response.isSuccess) {
      return response;
    } else {
      const errorMessage = response.message || "Registration failed";
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.log("Registration error:", error);

    let errorMessage = "Registration failed";

    if (error.response) {
      // The server responded with an error status
      errorMessage =
        error.response.data?.message || error.response.data || errorMessage;
    } else if (error.message) {
      // Network error or custom error
      errorMessage = error.message;
    }

    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// Verify OTP service
export const verifyOtp = async (userId, otp, purpose = "Registration") => {
  const { dispatch } = store;

  try {
    dispatch(setLoading(true));
    dispatch(clearError());

    const response = await api.post("/Auth/VerifyOtp", {
      userId,
      otp,
      purpose,
    });

    if (response.isSuccess) {
      return response;
    } else {
      const errorMessage = response.message || "OTP verification failed";
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    }
  } catch (error) {
    let errorMessage = "OTP verification failed";

    if (error.response) {
      // The server responded with an error status
      errorMessage =
        error.response.data?.message || error.response.data || errorMessage;
    } else if (error.message) {
      // Network error or custom error
      errorMessage = error.message;
    }

    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// Logout service
export const logout = () => {
  const { dispatch } = store;

  // This will handle clearing localStorage too
  dispatch(logoutUser());

  // Redirect to login page if needed
  window.location.href = "/login";
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const state = store.getState();
  return state.user.isAuthenticated;
};

// Get current user
export const getCurrentUser = () => {
  const state = store.getState();
  return state.user.user;
};

// Get auth token
export const getToken = () => {
  const state = store.getState();
  return state.user.token;
};

const AuthService = {
  login,
  register,
  verifyOtp,
  logout,
  isAuthenticated,
  getCurrentUser,
  getToken,
};

export default AuthService;
