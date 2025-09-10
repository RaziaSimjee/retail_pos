import { apiSlice } from "./apiSlice";
import { API_GATEWAY_URL } from "../constants";

export const productSizeSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductSizes: builder.query({
      query: ({ skip = 0, take = 100 }) =>
        `${API_GATEWAY_URL}/productcatalog/productsizes/${skip}/${take}`,
      keepUnusedDataFor: 5,
      providesTags: ["ProductSize"],
    }),
    getProductSizeById: builder.query({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productsizes/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "ProductSize", id }],
    }),
    createProductSize: builder.mutation({
      query: (payload) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productsizes`,
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["ProductSize"],
    }),
    updateProductSize: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productsizes/${id}`,
        method: "PUT",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["ProductSize"],
    }),
    deleteProductSize: builder.mutation({
      query: ({ id }) => ({
        url: `${API_GATEWAY_URL}/productcatalog/productsizes/${id}`,
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["ProductSize"],
    }),
  }),
});

export const {
  useGetProductSizesQuery,
  useGetProductSizeByIdQuery,
  useCreateProductSizeMutation,
  useUpdateProductSizeMutation,
  useDeleteProductSizeMutation,
} = productSizeSlice;
