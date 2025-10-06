// ../slices/purchaseOrderApiSlice.js
import { apiSlice } from "./apiSlice";
import { API_GATEWAY_URL } from "../constants";

export const purchaseOrderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllPurchaseOrders: builder.query({
      query: () => ({
        url: `api/purchaseOrders`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["PurchaseOrder"],
    }),

    getPurchaseOrderById: builder.query({
      query: (id) => ({
        url: `api/purchaseOrders/${id}`,
      }),
      providesTags: ["PurchaseOrder"],
    }),

    addPurchaseOrder: builder.mutation({
      query: (payload) => ({
        url: `api/purchaseOrders`,
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["PurchaseOrder"],
    }),

    updatePurchaseOrder: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `api/purchaseOrders/${id}`,
        method: "PUT",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["PurchaseOrder"],
    }),

    deletePurchaseOrder: builder.mutation({
      query: (id) => ({
        url: `api/purchaseOrders/${id}`,
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["PurchaseOrder"],
    }),
  }),
});

export const {
  useGetAllPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useAddPurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
} = purchaseOrderApiSlice;
