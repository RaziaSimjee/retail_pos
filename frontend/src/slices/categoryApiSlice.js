import { apiSlice } from "./apiSlice";
import { API_GATEWAY_URL } from "../constants";
export const categorySlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: ({ skip = 0, take = 100 }) => ({
        url: `${API_GATEWAY_URL}/productcatalog/categories/${skip}/${take}`,
      }),
      keepUnusedDataFor: 5,
    }),
    getCategoriesCount: builder.query({
      query: () => ({
        url: `${API_GATEWAY_URL}/productcatalog/categories/count`,
      }),
      keepUnusedDataFor: 5,
    }),
    createCategory: builder.mutation({
      query: (payload) => ({
        url: `${API_GATEWAY_URL}/productcatalog/categories`,
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${API_GATEWAY_URL}/productcatalog/categories/${id}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation({
      query: ({ id }) => ({
        url: `${API_GATEWAY_URL}/productcatalog/categories/${id}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "Category" }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoriesCountQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categorySlice;
