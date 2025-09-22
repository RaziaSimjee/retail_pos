import { apiSlice } from "./apiSlice"; // central API slice

export const addressesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllAddresses: builder.query({
      query: () => "/api/addresses",
      providesTags: ["Addresses"],
    }),
    getAddressesByUserId: builder.query({
      query: (userId) => `/api/addresses/users/${userId}`,
      providesTags: ["Addresses"],
    }),

    addAddress: builder.mutation({
      query: (address) => ({
        url: "/api/addresses",
        method: "POST",
        body: address,
      }),
      invalidatesTags: ["Addresses"],
    }),
    updateAddress: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/addresses/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Addresses"],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/api/addresses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Addresses"],
    }),
  }),
});

export const {
  useGetAllAddressesQuery,
  useGetAddressesByUserIdQuery,

  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressesApiSlice;
