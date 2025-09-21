import { apiSlice } from "./apiSlice";

export const suppliersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllSuppliers: builder.query({
      query: () => "/api/suppliers",
      providesTags: ["Suppliers"],
    }),
    addSupplier: builder.mutation({
      query: (supplier) => ({
        url: "/api/suppliers",
        method: "POST",
        body: supplier,
      }),
      invalidatesTags: ["Suppliers"],
    }),
    updateSupplier: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/suppliers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Suppliers"],
    }),
    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/api/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Suppliers"],
    }),
  }),
});

export const {
  useGetAllSuppliersQuery,
  useAddSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApiSlice;
