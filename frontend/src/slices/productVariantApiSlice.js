import { apiSlice } from './apiSlice';
import { API_GATEWAY_URL } from '../constants';
export const productVariantSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductVariants: builder.query({
      query: () => ({
        url: 'http://localhost:5000/productvariants/0/100',
      }),
      keepUnusedDataFor: 5,
    }),
    createProductVariant: builder.mutation({
      query: (payload) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productvariants`,
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['ProductVariants'],
    }),
  }),
});
export const { useGetProductVariantsQuery, useCreateProductVariantMutation } = productVariantSlice;
