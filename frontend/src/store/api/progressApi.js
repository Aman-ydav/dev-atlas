import { apiSlice } from "./apiSlice";
import { unwrap, transformError, toQueryString } from "@/lib/apiHelpers";

export const progressApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProgress: builder.query({
            query: (knowledgeId) => `/progress/${knowledgeId}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: (result, error, knowledgeId) => [{ type: "Progress", id: knowledgeId }],
        }),
        updateProgress: builder.mutation({
            query: ({ knowledgeId, ...body }) => ({
                url: `/progress/${knowledgeId}`,
                method: "PATCH",
                body,
            }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: (result, error, { knowledgeId }) => [
                { type: "Progress", id: knowledgeId },
                "ProgressList",
                "Dashboard",
            ],
        }),
        submitRevision: builder.mutation({
            query: ({ knowledgeId, result }) => ({
                url: `/progress/${knowledgeId}/revision`,
                method: "POST",
                body: { result },
            }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: (result, error, { knowledgeId }) => [
                { type: "Progress", id: knowledgeId },
                "ProgressList",
                "Dashboard",
            ],
        }),
        markForRevision: builder.mutation({
            query: ({ knowledgeId, marked }) => ({
                url: `/progress/${knowledgeId}/revision/mark`,
                method: "PATCH",
                body: { marked },
            }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: (result, error, { knowledgeId }) => [
                { type: "Progress", id: knowledgeId },
                "ProgressList",
                "Dashboard",
            ],
        }),
        getDueForRevision: builder.query({
            query: (params) => `/progress/revision/due${toQueryString(params)}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: ["ProgressList"],
        }),
        getBookmarks: builder.query({
            query: (params) => `/progress/bookmarks${toQueryString(params)}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: ["ProgressList"],
        }),
        getPinned: builder.query({
            query: (params) => `/progress/pinned${toQueryString(params)}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: ["ProgressList"],
        }),
        getFavorites: builder.query({
            query: (params) => `/progress/favorites${toQueryString(params)}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: ["ProgressList"],
        }),
    }),
});

export const {
    useGetProgressQuery,
    useUpdateProgressMutation,
    useSubmitRevisionMutation,
    useMarkForRevisionMutation,
    useGetDueForRevisionQuery,
    useGetBookmarksQuery,
    useGetPinnedQuery,
    useGetFavoritesQuery,
} = progressApi;
