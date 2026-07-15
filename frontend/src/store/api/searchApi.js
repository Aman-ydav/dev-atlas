import { apiSlice } from "./apiSlice";
import { unwrap, transformError, toQueryString } from "@/lib/apiHelpers";

export const searchApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        search: builder.query({
            query: (params) => `/search${toQueryString(params)}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
        }),
        getRecentSearches: builder.query({
            query: () => "/search/recent",
            transformResponse: unwrap,
            transformErrorResponse: transformError,
        }),
    }),
});

export const { useSearchQuery, useLazySearchQuery, useGetRecentSearchesQuery } = searchApi;
