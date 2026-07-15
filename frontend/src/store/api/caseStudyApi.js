import { apiSlice } from "./apiSlice";
import { unwrap, transformError, toQueryString } from "@/lib/apiHelpers";

export const caseStudyApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCaseStudyHub: builder.query({
            query: (params) => `/case-studies${toQueryString(params)}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            // Reuses the existing "KnowledgeList" tag rather than inventing a
            // new one — createKnowledge/updateKnowledge/publishKnowledge already
            // invalidate it, so editing or publishing any project card busts
            // the hub's cache with zero new tag plumbing.
            providesTags: ["KnowledgeList"],
        }),
    }),
});

export const { useGetCaseStudyHubQuery } = caseStudyApi;
