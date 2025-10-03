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
  }),
});

export const {
  useCreateSaleMutation
} = saleSlice;
