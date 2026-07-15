import { apiSlice } from "./apiSlice";
import { unwrap, transformError } from "@/lib/apiHelpers";

export const dashboardApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDashboard: builder.query({
            query: () => "/dashboard",
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: ["Dashboard"],
        }),
    }),
});

export const { useGetDashboardQuery } = dashboardApi;
