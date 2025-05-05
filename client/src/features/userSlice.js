import { createSlice } from "@reduxjs/toolkit";

// Check localStorage for existing auth data
const loadAuthFromStorage = () => {
  try {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        user,
        token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    }
  } catch (error) {
    // If there's an error parsing, clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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

  return "light";
};

// Apply theme to document
const applyTheme = (theme) => {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }

  localStorage.setItem("theme", theme);
};

const initialState = {
  ...loadAuthFromStorage(),
  theme: loadThemePreference(), // Add theme to initial state
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
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      // Save to localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },

    // Logout user
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    // Update user information
    updateUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(state.user));
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set theme
    setTheme: (state, action) => {
      const theme = action.payload;
      state.theme = theme;
      applyTheme(theme);
    },

    // Toggle theme
    toggleTheme: (state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      state.theme = newTheme;
      applyTheme(newTheme);
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
