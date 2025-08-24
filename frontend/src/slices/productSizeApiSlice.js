import { apiSlice } from './apiSlice';
import { API_GATEWAY_URL } from '../constants';
export const productSizeSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductSizes: builder.query({
      query: ({skip=0, take=100}) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productsizes/${skip}/${take}`,
      }),
      keepUnusedDataFor: 5,
    }),
    createProductSize: builder.mutation({
      query: (payload) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productsizes`,
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
  }),
});
export const { useGetProductSizesQuery, useCreateProductSizeMutation } = productSizeSlice;
