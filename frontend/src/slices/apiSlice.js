/* eslint-disable no-unused-vars */
import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'http://localhost:3000';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    // Get JWT from localStorage auth slice
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));
    const token = storedUser?.token; 

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['Users', 'Product', 'Order', 'Category', 'ProductVariants', 'Payment', 'Brand', 'Loyalty'],
  endpoints: (builder) => ({}),
});
