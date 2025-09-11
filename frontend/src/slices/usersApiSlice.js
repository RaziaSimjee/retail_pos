import { apiSlice } from "./apiSlice";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/api/users/login",
        method: "POST",
        body: credentials,
        credentials: "include", // important for HTTP-only cookies
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "/api/users/register",
        method: "POST",
        body: userData,
        credentials: "include",
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/api/users/logout",
        method: "POST",
        credentials: "include",
      }),
    }),
    getUserById: builder.query({
      query: (id) => `/api/users/${id}`,
      providesTags: ["Users"],
    }),
    getUsersByRole: builder.query({
      query: (role) => `/api/users/role/${role}`,
      providesTags: ["Users"],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/api/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetUserByIdQuery,
  useGetUsersByRoleQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} = usersApiSlice;
