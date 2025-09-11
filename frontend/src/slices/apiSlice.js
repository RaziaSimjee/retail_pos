/* eslint-disable no-unused-vars */
import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';
const BASE_URL = 'http://localhost:3000';
const baseQuery = fetchBaseQuery({ baseUrl: BASE_URL });
export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['Users', 'Product', 'Order', 'Category', 'ProductVariants', 'Payment', 'Brand'],
  endpoints: (builder) => ({}),
});