import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      state.items = action.payload;
    },
    addCartItem: (state, action) => {
      const existingItem = state.items.find(
        (item) => item.bookId === action.payload.bookId
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeCartItem: (state, action) => {
      state.items = state.items.filter(
        (item) => item.bookId !== action.payload
      );
    },
    updateCartItemQuantity: (state, action) => {
      const { bookId, quantity } = action.payload;
      const item = state.items.find((item) => item.bookId === bookId);

      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    setCartLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setCartError: (state, action) => {
      state.error = action.payload;
    },
    clearCartError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCartItems,
  addCartItem,
  removeCartItem,
  updateCartItemQuantity,
  clearCart,
  setCartLoading,
  setCartError,
  clearCartError,
} = cartSlice.actions;

export default cartSlice.reducer;
