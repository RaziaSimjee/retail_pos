import { apiSlice } from "./apiSlice";
import { API_GATEWAY_URL } from "../constants";

export const productVariantSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductVariants: builder.query({
      query: ({ skip = 0, take = 100 } = {}) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productvariants/${skip}/${take}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["ProductVariants"],
    }),
    getProductVariantsById: builder.query({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productvariants/${id}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: (result, error, id) => [{ type: "ProductVariants", id }],
    }),
    getAllSerialNumbers: builder.query({
      query: ({skip = 0, take = 100}) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productserialnumbers/${skip}/${take}`,  
      }),
      keepUnusedDataFor: 5,
      providesTags: ["ProductSerialNumbers"],
    }),
    getSerialNumbersById: builder.query({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productserialnumbers/${id}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: (result, error, id) => [{ type: "ProductSerialNumbers", id }],
    }),
    createSerialNumbers: builder.mutation({
      query: (payload) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productserialnumbers`,
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["ProductSerialNumbers"],
    }),
    updateSerialNumbers: builder.mutation({
      query: (payload) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productserialnumbers/${payload.id}`,
        method: "PUT",
        body: payload,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["ProductSerialNumbers"],
    }),
    deleteSerialNumbers: builder.mutation({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productserialnumbers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductSerialNumbers"],
    }),

    createProductVariant: builder.mutation({
      query: (payload) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productvariants`,
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["ProductVariants"],
    }),
    updateProductVariant: builder.mutation({
      query: (payload) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productvariants/${payload.id}`,
        method: "PUT",
        body: payload,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["ProductVariants"],
    }),
    deleteProductVariant: builder.mutation({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productvariants/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductVariants"],
    }),
  }),
});

export const {
  useGetProductVariantsQuery,
  useGetProductVariantsByIdQuery,
  useGetAllSerialNumbersQuery,
  useGetSerialNumbersByIdQuery,
  useCreateSerialNumbersMutation,
  useUpdateSerialNumbersMutation,
  useDeleteSerialNumbersMutation,
  useCreateProductVariantMutation,
  useUpdateProductVariantMutation,
  useDeleteProductVariantMutation,
} = productVariantSlice;
