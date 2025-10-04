import { apiSlice } from "./apiSlice";
import { API_GATEWAY_URL } from "../constants";
export const saleSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createSale: builder.mutation({
      query: (payload) => ({
        url: `${API_GATEWAY_URL}/saleService/sales`,
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Sales"],
    }),
    getAllSales: builder.query({
      query: ({ skip = 0, take = 100 }) => ({
        url: `${API_GATEWAY_URL}/saleService/sales/${skip}/${take}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      providesTags: ["Sales"],
    }),
    getReceiptById: builder.query({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/saleService/sales/${id}/receipt`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      providesTags: ["Sales"],
    }),
  }),
});

export const {
  useCreateSaleMutation,
  useGetReceiptByIdQuery,
  useGetAllSalesQuery,
} = saleSlice;
