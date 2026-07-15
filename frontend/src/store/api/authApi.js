import { apiSlice } from "./apiSlice";
import { unwrap, transformError } from "@/lib/apiHelpers";

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMe: builder.query({
            query: () => "/auth/me",
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: ["Me"],
        }),
        logout: builder.mutation({
            query: () => ({ url: "/auth/logout", method: "POST" }),
            invalidatesTags: ["Me"],
        }),
        refresh: builder.mutation({
            query: () => ({ url: "/auth/refresh", method: "POST" }),
        }),
    }),
});

export const { useGetMeQuery, useLogoutMutation, useRefreshMutation } = authApi;
