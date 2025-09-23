import { apiSlice } from "./apiSlice";
import { API_GATEWAY_URL } from "../constants";

export const loyaltyProgramSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ===========================
    // Get Queries
    // ===========================
    getAllCustomers: builder.query({
      query: ({ skip = 0, take = 100 }) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/customers/${skip}/${take}`,
      }),
      keepUnusedDataFor: 5,
      invalidatesTags: [{ type: "Loyalty" }],
    }),

    getCustomerById: builder.query({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/customers/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    getCustomersCount: builder.query({
      query: () => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/customers/count`,
      }),
      providesTags: [{ type: "Loyalty" }],
    }),

    getLoyaltyWalletsById: builder.query({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltywallets/${id}`,
      }),
      keepUnusedDataFor: 5,
      invalidatesTags: [{ type: "Loyalty" }],
    }),

    getAllLoyaltyWallets: builder.query({
      query: ({ skip = 0, take = 100 }) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltywallets/${skip}/${take}`,
      }),
      keepUnusedDataFor: 5,
      invalidatesTags: [{ type: "Loyalty" }],
    }),

    getLoyaltyWalletsCount: builder.query({
      query: () => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltywallets/count`,
      }),
      providesTags: [{ type: "Loyalty" }],
    }),

    getCustomerLoyaltyWallet: builder.query({
      query: (customerId) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltywallets/customer/${customerId}`,
      }),
      providesTags: [{ type: "Loyalty" }],
    }),

    getLoyaltyRulesById: builder.query({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyrules/${id}`,
      }),
      providesTags: [{ type: "Loyalty" }],
    }),

    getAllLoyaltyRules: builder.query({
      query: ({ skip = 0, take = 100 }) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyrules/${skip}/${take}`,
      }),
      keepUnusedDataFor: 5,
      invalidatesTags: [{ type: "Loyalty" }],
    }),

    getLoyaltyRulesCount: builder.query({
      query: () => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyrules/count`,
      }),
      providesTags: [{ type: "Loyalty" }],
    }),

    getLoyaltyRewardsByWalletId: builder.query({
      query: ({ walletId, skip = 100, take = 100 }) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyrewards/wallet/${walletId}/${skip}/${take}`,
      }),
      providesTags: [{ type: "Loyalty" }],
    }),

    getLoyaltyRewardsCountByWalletId: builder.query({
      query: (walletId) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyrewards/wallet/${walletId}/count`,
      }),
      providesTags: [{ type: "Loyalty" }],
    }),

    getLoyaltyRewardsById: builder.query({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyrewards/${id}`,
      }),
      providesTags: [{ type: "Loyalty" }],
    }),

    getTotalPointsRewardedByWalletId: builder.query({
      query: (walletId) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyrewards/wallet/${walletId}/totalpoints`,
      }),
      providesTags: [{ type: "Loyalty" }],
    }),

    getAllLoyaltySpendingsByWalletId: builder.query({
      query: ({ walletId, skip = 0, take = 100 }) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyrewards/wallet/${walletId}/${skip}/${take}`,
      }),
      providesTags: [{ type: "Loyalty" }],
    }),

    getLoyaltySpendingById: builder.query({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyspendings/${id}`,
      }),
      providesTags: [{ type: "Loyalty" }],
    }),

    getLoyaltyPointValue: builder.query({
      query: () => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltypointvalue`,
      }),
      providesTags: [{ type: "Loyalty" }],
    }),

    getAllPointsSpentByWalletId: builder.query({
      query: ({walletId, skip=0, take=100}) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyspendings/wallet/${walletId}/${skip}/${take}`,
      }),
      providesTags: [{ type: "Loyalty" }],
    }),

    getTotalSpendingCountByWalletId: builder.query({
      query: (walletId) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyspendings/wallet/${walletId}/count`,
      }),
      providesTags: [{ type: "Loyalty" }],
    }),
    getTotalSpendingPointsByWalletId: builder.query({
      query: (walletId) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyspendings/wallet/${walletId}/totalpoints`,
      }),
      providesTags: [{ type: "Loyalty" }],
    }),
    // ===========================
    // PATCH Requests
    // ===========================
    awardPointsToWallet: builder.mutation({
      query: ({ walletId, transactionAmount }) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltywallet/${walletId}/${transactionAmount}/award`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "Loyalty" }],
    }),

    spendPointsFromWallet: builder.mutation({
      query: ({ walletId, pointsToSpend }) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltywallets/${walletId}/${pointsToSpend}/spend`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "Loyalty" }],
    }),

    // ===========================
    // POST Requests
    // ===========================
    createLoyaltyWallet: builder.mutation({
      query: (payload) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltywallets`,
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    createLoyaltyRule: builder.mutation({
      query: (payload) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyrules`,
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "Loyalty" }],
    }),

    createLoyaltyReward: builder.mutation({
      query: (payload) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyrewards`,
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "Loyalty" }],
    }),

    createLoyaltySpending: builder.mutation({
      query: (payload) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyspendings`,
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "Loyalty" }],
    }),

    // ===========================
    // PUT Requests
    // ===========================
    updateLoyaltyWallet: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltywallets/${id}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "Loyalty" }],
    }),

    updateLoyaltyRule: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyrules/${id}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "Loyalty" }],
    }),

    updateLoyaltyReward: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyrewards/${id}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "Loyalty" }],
    }),

    updateLoyaltySpending: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyspendings/${id}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "Loyalty" }],
    }),

    updateLoyaltyPointValue: builder.mutation({
      query: (data) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltypointvalue`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: [{ type: "Loyalty" }],
    }),

    // ===========================
    // DELETE Requests
    // ===========================
    deleteLoyaltyWallet: builder.mutation({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltywallets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Loyalty" }],
    }),

    deleteLoyaltyRule: builder.mutation({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyrules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Loyalty" }],
    }),

    deleteLoyaltyReward: builder.mutation({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyrewards/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Loyalty" }],
    }),

    deleteLoyaltySpending: builder.mutation({
      query: (id) => ({
        url: `${API_GATEWAY_URL}/loyaltyProgram/loyaltyspendings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Loyalty" }],
    }),
  }),
});

export const {
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
  useGetCustomersCountQuery,
  useGetLoyaltyWalletsByIdQuery,
  useGetAllLoyaltyWalletsQuery,
  useGetLoyaltyWalletsCountQuery,
  useGetCustomerLoyaltyWalletQuery,
  useGetLoyaltyRulesByIdQuery,
  useGetAllLoyaltyRulesQuery,
  useGetLoyaltyRulesCountQuery,
  useGetLoyaltyRewardsByWalletIdQuery,
  useGetLoyaltyRewardsCountByWalletIdQuery,
  useGetLoyaltyRewardsByIdQuery,
  useGetTotalPointsRewardedByWalletIdQuery,
  useGetAllPointsSpentByWalletIdQuery,
  useGetTotalSpendingCountByWalletIdQuery,
  useGetLoyaltyPointValueQuery,
  useGetTotalSpendingPointsByWalletIdQuery,
  // Loyalty Spendings
  useGetAllLoyaltySpendingsByWalletIdQuery,
  useGetLoyaltySpendingByIdQuery,
  // PATCH
  useAwardPointsToWalletMutation,
  useSpendPointsFromWalletMutation,
  // POST
  useCreateLoyaltyWalletMutation,
  useCreateLoyaltyRuleMutation,
  useCreateLoyaltyRewardMutation,
  useCreateLoyaltySpendingMutation,
  // PUT
  useUpdateLoyaltyWalletMutation,
  useUpdateLoyaltyRuleMutation,
  useUpdateLoyaltyRewardMutation,
  useUpdateLoyaltySpendingMutation,
  useUpdateLoyaltyPointValueMutation,
  // DELETE
  useDeleteLoyaltyWalletMutation,
  useDeleteLoyaltyRuleMutation,
  useDeleteLoyaltyRewardMutation,
  useDeleteLoyaltySpendingMutation,
} = loyaltyProgramSlice;
