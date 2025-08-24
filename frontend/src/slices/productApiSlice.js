import { apiSlice } from './apiSlice';
import { API_GATEWAY_URL } from '../constants';
export const productslice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ skip = 0, take = 100 }) => ({
        url: `${API_GATEWAY_URL}/productcatalog/products/${skip}/${take}`,
      }),
      keepUnusedDataFor: 5,
      invalidatesTags: [{ type: 'Product' }],
    }),
    createProduct: builder.mutation({
      query: (payload) => ({
        url: `${API_GATEWAY_URL}/productcatalog/products`,
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
    deleteProduct: builder.mutation({
      query: ({ id }) => ({
        url: `${API_GATEWAY_URL}/productcatalog/products/${id}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
    invalidatesTags: [{ type: 'Product' }],
  }),
});
export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
} = productslice;
