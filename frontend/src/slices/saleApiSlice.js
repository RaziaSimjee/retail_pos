import { apiSlice } from "./apiSlice";
import { API_GATEWAY_URL } from "../constants";

export const saleSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Existing mutations and queries
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
      query: ({ skip = 0, take = 100 } = {}) => ({
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

    // New queries
    getTotalSales: builder.query({
      query: () => ({
        url: `${API_GATEWAY_URL}/saleService/sales/total`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),
    getTotalSalesByCustomer: builder.query({
      query: (customerId) => ({
        url: `${API_GATEWAY_URL}/saleService/sales/customer/${customerId}/total`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),
    getTotalSalesByEmployee: builder.query({
      query: (employeeId) => ({
        url: `${API_GATEWAY_URL}/saleService/sales/employee/${employeeId}/total`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),
    getTotalSalesByMonth: builder.query({
      query: ({ year, month }) => ({
        url: `${API_GATEWAY_URL}/saleService/sales/total/${year}/${month}`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),
    getTotalSalesByYearRange: builder.query({
      query: ({ startYear, endYear }) => ({
        url: `${API_GATEWAY_URL}/saleService/sales/total/year/${startYear}/${endYear}`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),
    getSaleById: builder.query({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/saleService/sales/${id}`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),
    getSalesCount: builder.query({
      query: () => ({
        url: `${API_GATEWAY_URL}/saleService/sales/count`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),
    getCustomerSalesCount: builder.query({
      query: (customerId) => ({
        url: `${API_GATEWAY_URL}/saleService/sales/customer/${customerId}/count`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),
    getCustomerSales: builder.query({
      query: (customerId) => ({
        url: `${API_GATEWAY_URL}/saleService/sales/customer/${customerId}`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),
    getEmployeeSalesCount: builder.query({
      query: (employeeId) => ({
        url: `${API_GATEWAY_URL}/saleService/sales/employee/${employeeId}/count`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),
    getEmployeeSales: builder.query({
      query: ({ employeeId, skip = 0, take = 100 }) => ({
        url: `${API_GATEWAY_URL}/saleService/sales/employee/${employeeId}/${skip}/${take}`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),
    getProductSalesCount: builder.query({
      query: (productId) => ({
        url: `${API_GATEWAY_URL}/saleService/sales/product/${productId}/count`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),
    getFilteredSales: builder.query({
      query: ({ customerId, employeeId, productId, skip = 0, take = 100 }) => ({
        url: `${API_GATEWAY_URL}/saleService/sales/${customerId}/${employeeId}/${productId}/${skip}/${take}`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),
    getFilteredSalesCount: builder.query({
      query: ({ customerId, employeeId, productId }) => ({
        url: `${API_GATEWAY_URL}/saleService/sales/${customerId}/${employeeId}/${productId}/count`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),
    getProductSales: builder.query({
      query: ({ productId, skip = 0, take = 100 }) => ({
        url: `${API_GATEWAY_URL}/saleService/sales/product/${productId}/${skip}/${take}`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),
    exportSales: builder.query({
      query: ({ fromId, toId }) => ({
        url: `${API_GATEWAY_URL}/saleService/sales/export/${fromId}/${toId}`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),
  }),
});

export const {
  useCreateSaleMutation,
  useGetAllSalesQuery,
  useGetReceiptByIdQuery,
  useGetTotalSalesQuery,
  useGetTotalSalesByCustomerQuery,
  useGetTotalSalesByEmployeeQuery,
  useGetTotalSalesByMonthQuery,
  useGetTotalSalesByYearRangeQuery,
  useGetSaleByIdQuery,
  useGetSalesCountQuery,
  useGetCustomerSalesCountQuery,
  useGetCustomerSalesQuery,
  useGetEmployeeSalesCountQuery,
  useGetEmployeeSalesQuery,
  useGetProductSalesCountQuery,
  useGetFilteredSalesQuery,
  useGetFilteredSalesCountQuery,
  useGetProductSalesQuery,
  useExportSalesQuery,
} = saleSlice;
