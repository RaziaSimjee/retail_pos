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
      invalidatesTags: ["Category"],
    }),
    getReceiptById: builder.query({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/saleService/sales/${id}/receipt`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      providesTags: ["Category"],
    }),
  }),
});

export const {
  useCreateSaleMutation,
    useGetReceiptByIdQuery,
} = saleSlice;
