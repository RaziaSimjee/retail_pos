import { createSlice } from "@reduxjs/toolkit";

// Load cart from localStorage if available
const initialState = localStorage.getItem("cart")
  ? JSON.parse(localStorage.getItem("cart"))
  : {
      cartItems: [],
      itemsPrice: 0,
      shippingPrice: 0,
      taxPrice: 0,
      totalPrice: 0,
    };

// Helper to calculate decimals
const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        // Update quantity, respecting stock limit
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id
            ? { ...x, qty: Math.min(x.qty + Number(item.qty), x.quantity) }
            : x
        );
      } else {
        state.cartItems.push({ ...item, qty: Number(item.qty) });
      }

      // Recalculate totals
      state.itemsPrice = addDecimals(
        state.cartItems.reduce((acc, x) => acc + x.price * x.qty, 0)
      );
      state.shippingPrice = addDecimals(state.itemsPrice > 100 ? 0 : 10);
      state.taxPrice = addDecimals(Number((0.15 * state.itemsPrice).toFixed(2)));
      state.totalPrice = (
        Number(state.itemsPrice) +
        Number(state.shippingPrice) +
        Number(state.taxPrice)
      ).toFixed(2);

      localStorage.setItem("cart", JSON.stringify(state));
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);

      // Recalculate totals
      state.itemsPrice = addDecimals(
        state.cartItems.reduce((acc, x) => acc + x.price * x.qty, 0)
      );
      state.shippingPrice = addDecimals(state.itemsPrice > 100 ? 0 : 10);
      state.taxPrice = addDecimals(Number((0.15 * state.itemsPrice).toFixed(2)));
      state.totalPrice = (
        Number(state.itemsPrice) +
        Number(state.shippingPrice) +
        Number(state.taxPrice)
      ).toFixed(2);

      localStorage.setItem("cart", JSON.stringify(state));
    },

    adjustQty: (state, action) => {
      const { id, qty } = action.payload;
      state.cartItems = state.cartItems.map((x) =>
        x._id === id
          ? { ...x, qty: Math.min(Math.max(Number(qty), 1), x.quantity) }
          : x
      );

      // Recalculate totals
      state.itemsPrice = addDecimals(
        state.cartItems.reduce((acc, x) => acc + x.price * x.qty, 0)
      );
      state.shippingPrice = addDecimals(state.itemsPrice > 100 ? 0 : 10);
      state.taxPrice = addDecimals(Number((0.15 * state.itemsPrice).toFixed(2)));
      state.totalPrice = (
        Number(state.itemsPrice) +
        Number(state.shippingPrice) +
        Number(state.taxPrice)
      ).toFixed(2);

      localStorage.setItem("cart", JSON.stringify(state));
    },

    // 🆕 Reset the cart after checkout
    resetCart: (state) => {
      state.cartItems = [];
      state.itemsPrice = 0;
      state.shippingPrice = 0;
      state.taxPrice = 0;
      state.totalPrice = 0;
      localStorage.removeItem("cart");
    },
  },
});

export const { addToCart, removeFromCart, adjustQty, resetCart } =
  cartSlice.actions;
export default cartSlice.reducer;
