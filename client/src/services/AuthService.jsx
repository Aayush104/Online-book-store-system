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
      dispatch(setError(response.message || "Login failed"));
      throw new Error(response.message || "Login failed");
    }
  } catch (error) {
    dispatch(setError(error.message || "Login failed"));
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

    if (response.isSuccess) {
      dispatch(setLoading(false));
      return response;
    } else {
      dispatch(setError(response.message || "Registration failed"));
      throw new Error(response.message || "Registration failed");
    }
  } catch (error) {
    dispatch(setError(error.message || "Registration failed"));
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
      dispatch(setLoading(false));
      return response;
    } else {
      dispatch(setError(response.message || "OTP verification failed"));
      throw new Error(response.message || "OTP verification failed");
    }
  } catch (error) {
    dispatch(setError(error.message || "OTP verification failed"));
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
