import { apiSlice } from './apiSlice';
import { API_GATEWAY_URL } from '../constants';
export const brandSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query({
      query: ({ skip = 0, take = 100 }) => ({
        url: `${API_GATEWAY_URL}/productcatalog/brands/${skip}/${take}`,
      }),
      keepUnusedDataFor: 5,
    }),
    getBrandsCount: builder.query({
      query: () => ({
        url: `${API_GATEWAY_URL}/productcatalog/brands/count`,
      }),
      keepUnusedDataFor: 5,
    }),
    createBrand: builder.mutation({
      query: (payload) => ({
        url: `${API_GATEWAY_URL}/productcatalog/brands`,
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Brand'],
    }),
    updateBrand: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${API_GATEWAY_URL}/productcatalog/brands/${id}`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Brand'],
    }),
    deleteBrand: builder.mutation({
      query: ({id = 0}) => ({
        url: `${API_GATEWAY_URL}/productcatalog/brands/${id}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Brand'],
    }),
  }),
});
export const {
  useGetBrandsQuery,
  useGetBrandsCountQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandSlice;
