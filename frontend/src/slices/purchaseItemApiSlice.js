import { apiSlice } from "./apiSlice";
import { API_GATEWAY_URL } from "../constants";

export const purchaseItemApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllPurchaseItems: builder.query({
      query: () => ({
        url: `api/purchaseItems`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["PurchaseItem"],
    }),

    getPurchaseItemById: builder.query({
      query: (id) => ({
        url: `api/purchaseItems/${id}`,
      }),
      providesTags: ["PurchaseItem"],
    }),

    getPurchaseItemsByOrderId: builder.query({
      query: (orderId) => ({
        url: `api/purchaseItems/byOrder/${orderId}`,
      }),
      providesTags: ["PurchaseItem"],
    }),

    addPurchaseItem: builder.mutation({
      query: (payload) => ({
        url: `api/purchaseItems`,
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["PurchaseItem"],
    }),

    updatePurchaseItem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `api/purchaseItems/${id}`,
        method: "PUT",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["PurchaseItem"],
    }),

    deletePurchaseItem: builder.mutation({
      query: (id) => ({
        url: `api/purchaseItems/${id}`,
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["PurchaseItem"],
    }),
  }),
});

export const {
  useGetAllPurchaseItemsQuery,
  useGetPurchaseItemByIdQuery,
  useGetPurchaseItemsByOrderIdQuery,
  useAddPurchaseItemMutation,
  useUpdatePurchaseItemMutation,
  useDeletePurchaseItemMutation,
} = purchaseItemApiSlice;
