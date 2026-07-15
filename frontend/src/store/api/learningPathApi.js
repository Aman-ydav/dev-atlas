import { apiSlice } from "./apiSlice";
import { unwrap, transformError, toQueryString } from "@/lib/apiHelpers";

export const learningPathApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getLearningPaths: builder.query({
            query: (params) => `/learning-paths${toQueryString(params)}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: (result) =>
                result
                    ? [...result.map((p) => ({ type: "LearningPath", id: p.slug })), "LearningPathList"]
                    : ["LearningPathList"],
        }),
        getLearningPathBySlug: builder.query({
            query: (slug) => `/learning-paths/${slug}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: (result, error, slug) => [{ type: "LearningPath", id: slug }],
        }),
        getPathsForKnowledge: builder.query({
            query: (knowledgeId) => `/learning-paths/for-knowledge/${knowledgeId}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: (result, error, knowledgeId) => [{ type: "LearningPath", id: `for-${knowledgeId}` }],
        }),
        createLearningPath: builder.mutation({
            query: (body) => ({ url: "/learning-paths", method: "POST", body }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: ["LearningPathList"],
        }),
        updateLearningPath: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/learning-paths/${id}`, method: "PATCH", body }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: (result) => ["LearningPathList", { type: "LearningPath", id: result?.slug }],
        }),
        deleteLearningPath: builder.mutation({
            query: (id) => ({ url: `/learning-paths/${id}`, method: "DELETE" }),
            invalidatesTags: ["LearningPathList"],
        }),
    }),
});

export const {
    useGetLearningPathsQuery,
    useGetLearningPathBySlugQuery,
    useGetPathsForKnowledgeQuery,
    useCreateLearningPathMutation,
    useUpdateLearningPathMutation,
    useDeleteLearningPathMutation,
} = learningPathApi;
