import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  books: {
    items: [],
    totalCount: 0,
    pageSize: 10,
    currentPage: 1,
    totalPages: 0,
  },
  announcements: {
    items: [],
    totalCount: 0,
    pageSize: 10,
    currentPage: 1,
    totalPages: 0,
  },
  orders: {
    items: [],
    totalCount: 0,
    pageSize: 10,
    currentPage: 1,
    totalPages: 0,
  },
  selectedBook: null,
  loading: false,
  error: null,
};

export const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Book reducers
    setBooks: (state, action) => {
      state.books = {
        items: action.payload.items || [],
        totalCount: action.payload.totalCount || 0,
        pageSize: action.payload.pageSize || 10,
        currentPage: action.payload.currentPage || 1,
        totalPages: action.payload.totalPages || 0,
      };
    },
    setSelectedBook: (state, action) => {
      state.selectedBook = action.payload;
    },
    addBook: (state, action) => {
      // Add to items array if it doesn't exceed page size
      if (state.books.items.length < state.books.pageSize) {
        state.books.items.push(action.payload);
      }
      state.books.totalCount += 1;
      state.books.totalPages = Math.ceil(
        state.books.totalCount / state.books.pageSize
      );
    },
    updateBook: (state, action) => {
      // Update the book in the items array if it exists
      const index = state.books.items.findIndex(
        (book) => book.bookId === action.payload.bookId
      );
      if (index !== -1) {
        state.books.items[index] = action.payload;
      }

      // Also update selectedBook if it's the same book
      if (
        state.selectedBook &&
        state.selectedBook.bookId === action.payload.bookId
      ) {
        state.selectedBook = action.payload;
      }
    },
    removeBook: (state, action) => {
      // Remove the book from the items array
      state.books.items = state.books.items.filter(
        (book) => book.bookId !== action.payload
      );
      state.books.totalCount -= 1;
      state.books.totalPages = Math.ceil(
        state.books.totalCount / state.books.pageSize
      );

      // Clear selectedBook if it's the same book
      if (state.selectedBook && state.selectedBook.bookId === action.payload) {
        state.selectedBook = null;
      }
    },

    // Announcement reducers
    setAnnouncements: (state, action) => {
      state.announcements = {
        items: action.payload.items || [],
        totalCount: action.payload.totalCount || 0,
        pageSize: action.payload.pageSize || 10,
        currentPage: action.payload.currentPage || 1,
        totalPages: action.payload.totalPages || 0,
      };
    },
    addAnnouncement: (state, action) => {
      // Add to items array if it doesn't exceed page size
      if (state.announcements.items.length < state.announcements.pageSize) {
        state.announcements.items.push(action.payload);
      }
      state.announcements.totalCount += 1;
      state.announcements.totalPages = Math.ceil(
        state.announcements.totalCount / state.announcements.pageSize
      );
    },
    updateAnnouncement: (state, action) => {
      // Update the announcement in the items array if it exists
      const index = state.announcements.items.findIndex(
        (announcement) =>
          announcement.announcementId === action.payload.announcementId
      );
      if (index !== -1) {
        state.announcements.items[index] = action.payload;
      }
    },
    removeAnnouncement: (state, action) => {
      // Remove the announcement from the items array
      state.announcements.items = state.announcements.items.filter(
        (announcement) => announcement.announcementId !== action.payload
      );
      state.announcements.totalCount -= 1;
      state.announcements.totalPages = Math.ceil(
        state.announcements.totalCount / state.announcements.pageSize
      );
    },

    // Order reducers
    setOrders: (state, action) => {
      state.orders = {
        items: action.payload.items || [],
        totalCount: action.payload.totalCount || 0,
        pageSize: action.payload.pageSize || 10,
        currentPage: action.payload.currentPage || 1,
        totalPages: action.payload.totalPages || 0,
      };
    },
    updateOrder: (state, action) => {
      // Update the order in the items array if it exists
      const index = state.orders.items.findIndex(
        (order) => order.orderId === action.payload.orderId
      );
      if (index !== -1) {
        state.orders.items[index] = action.payload;
      }
    },

    // Reset state
    resetAdmin: (state) => {
      return initialState;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setBooks,
  setSelectedBook,
  addBook,
  updateBook,
  removeBook,
  setAnnouncements,
  addAnnouncement,
  updateAnnouncement,
  removeAnnouncement,
  setOrders,
  updateOrder,
  resetAdmin,
} = adminSlice.actions;

// Selectors
export const selectBooks = (state) => state.admin.books;
export const selectSelectedBook = (state) => state.admin.selectedBook;
export const selectAnnouncements = (state) => state.admin.announcements;
export const selectOrders = (state) => state.admin.orders;
export const selectLoading = (state) => state.admin.loading;
export const selectError = (state) => state.admin.error;

export default adminSlice.reducer;
