import { apiSlice } from "./apiSlice";
import { API_GATEWAY_URL } from "../constants";
export const productslice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ skip = 0, take = 100 }) => ({
        url: `${API_GATEWAY_URL}/productcatalog/products/${skip}/${take}`,
      }),
      keepUnusedDataFor: 5,
      invalidatesTags: [{ type: "Product" }],
    }),
    getProductById: builder.query({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/productcatalog/products/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation({
      query: (payload) => ({
        url: `${API_GATEWAY_URL}/productcatalog/products`,
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${API_GATEWAY_URL}/productcatalog/products/${id}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "Product" }],
    }),

    deleteProduct: builder.mutation({
      query: ({ id }) => ({
        url: `${API_GATEWAY_URL}/productcatalog/products/${id}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "Product" }],
    }),
  }),
});
export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productslice;
