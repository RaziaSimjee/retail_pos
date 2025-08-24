import { apiSlice } from './apiSlice';
import { API_GATEWAY_URL } from '../constants';
export const productColorSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductColors: builder.query({
      query: ({ skip = 0, take = 100 }) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productcolors/${skip}/${take}`,
      }),
      keepUnusedDataFor: 5,
    }),
    createProductColor: builder.mutation({
      query: (payload) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productcolors`,
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Color'],
    }),
    deleteProductColor: builder.mutation({
      query: ({ id = 0 }) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productcolors/${id}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Color'],
    }),
  }),
});
export const {
  useGetProductColorsQuery,
  useCreateProductColorMutation,
  useDeleteProductColorMutation,
} = productColorSlice;
