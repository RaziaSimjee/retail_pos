import { apiSlice } from "./apiSlice";
import { API_GATEWAY_URL } from "../constants";

export const supplierPaymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllSupplierPayments: builder.query({
      query: () => `api/supplierpayments`,
      keepUnusedDataFor: 5,
    }),
    addSupplierPayment: builder.mutation({
      query: (payload) => ({
        url: `api/supplierpayments`,
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["SupplierPayment"],
    }),
    updateSupplierPayment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `api/supplierpayments/${id}`,
        method: "PUT",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["SupplierPayment"],
    }),
    deleteSupplierPayment: builder.mutation({
      query: ({ id }) => ({
        url: `api/supplierpayments/${id}`,
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["SupplierPayment"],
    }),
  }),
});

export const {
  useGetAllSupplierPaymentsQuery,
  useAddSupplierPaymentMutation,
  useUpdateSupplierPaymentMutation,
  useDeleteSupplierPaymentMutation,
} = supplierPaymentApiSlice;
