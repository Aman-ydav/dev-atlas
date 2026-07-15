import { apiSlice } from "./apiSlice";
import { unwrap, transformError } from "@/lib/apiHelpers";

export const resourceApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getResources: builder.query({
            query: (knowledgeId) => `/resources${knowledgeId ? `?knowledge=${knowledgeId}` : ""}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: ["Resource"],
        }),
        createResource: builder.mutation({
            query: (body) => ({ url: "/resources", method: "POST", body }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: ["Resource"],
        }),
    }),
});

export const { useGetResourcesQuery, useCreateResourceMutation } = resourceApi;
