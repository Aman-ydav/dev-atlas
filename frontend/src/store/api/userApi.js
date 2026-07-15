import { apiSlice } from "./apiSlice";
import { unwrap, transformError, toQueryString } from "@/lib/apiHelpers";

export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        updateMe: builder.mutation({
            query: (body) => ({ url: "/users/me", method: "PATCH", body }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: ["Me"],
        }),
        listUsers: builder.query({
            query: (params) => `/users${toQueryString(params)}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: ["User"],
        }),
        updateUserRole: builder.mutation({
            query: ({ id, role }) => ({ url: `/users/${id}/role`, method: "PATCH", body: { role } }),
            invalidatesTags: ["User"],
        }),
        updateUserStatus: builder.mutation({
            query: ({ id, isActive }) => ({
                url: `/users/${id}/status`,
                method: "PATCH",
                body: { isActive },
            }),
            invalidatesTags: ["User"],
        }),
    }),
});

export const {
    useUpdateMeMutation,
    useListUsersQuery,
    useUpdateUserRoleMutation,
    useUpdateUserStatusMutation,
} = userApi;
