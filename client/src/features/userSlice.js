import { createSlice } from "@reduxjs/toolkit";

// Check localStorage for existing auth data
const loadAuthFromStorage = () => {
  try {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          user,
          token,
          isAuthenticated: true,
          loading: false,
          error: null,
        };
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Don't clear localStorage here - we'll let the component decide what to do
      }
    }
  } catch (error) {
    console.error("Error accessing localStorage:", error);
  }

  // Return default state if no valid data in localStorage
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };
};

// Load theme preference
const loadThemePreference = () => {
  try {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    // If no saved preference, check system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
  } catch (error) {
    console.error("Error loading theme preference:", error);
  }

  return "light"; // Default to light theme if error
};

// Apply theme to document
const applyTheme = (theme) => {
  try {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }

    localStorage.setItem("theme", theme);
  } catch (error) {
    console.error("Error applying theme:", error);
  }
};

const initialState = {
  ...loadAuthFromStorage(),
  theme: loadThemePreference(),
};

// Apply initial theme
applyTheme(initialState.theme);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Login user
    loginUser: (state, action) => {
      if (!action.payload || !action.payload.token) {
        console.error(
          "Attempted to login with invalid payload:",
          action.payload
        );
        return;
      }

      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      // Save to localStorage
      try {
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      } catch (error) {
        console.error("Error saving auth data to localStorage:", error);
      }
    },

    // Logout user
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      // Clear localStorage
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (error) {
        console.error("Error removing auth data from localStorage:", error);
      }
    },

    // Update user information
    updateUser: (state, action) => {
      if (!state.user || !action.payload) {
        console.error(
          "Cannot update user: No user in state or invalid payload"
        );
        return;
      }

      state.user = {
        ...state.user,
        ...action.payload,
      };

      // Update localStorage
      try {
        localStorage.setItem("user", JSON.stringify(state.user));
      } catch (error) {
        console.error("Error updating user in localStorage:", error);
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set theme
    setTheme: (state, action) => {
      const theme = action.payload;
      if (theme !== "light" && theme !== "dark") {
        console.error("Invalid theme value:", theme);
        return;
      }

      state.theme = theme;
      applyTheme(theme);
    },

    // Toggle theme
    toggleTheme: (state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      state.theme = newTheme;
      applyTheme(newTheme);
    },

    // Refresh auth state from localStorage
    refreshAuthState: (state) => {
      const authState = loadAuthFromStorage();

      if (authState.token && authState.user) {
        state.user = authState.user;
        state.token = authState.token;
        state.isAuthenticated = true;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  loginUser,
  logoutUser,
  updateUser,
  clearError,
  setTheme,
  toggleTheme,
  refreshAuthState,
} = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user.user;
export const selectToken = (state) => state.user.token;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectLoading = (state) => state.user.loading;
export const selectError = (state) => state.user.error;
export const selectUserRole = (state) => state.user.user?.role;
export const selectTheme = (state) => state.user.theme;

export default userSlice.reducer;
