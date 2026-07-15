import { apiSlice } from "./apiSlice";
import { unwrap, transformError } from "@/lib/apiHelpers";

export const annotationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAnnotations: builder.query({
            query: (knowledgeId) => `/annotations?knowledge=${knowledgeId}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: (result, error, knowledgeId) => [{ type: "Annotation", id: knowledgeId }],
        }),
        createAnnotation: builder.mutation({
            query: (body) => ({ url: "/annotations", method: "POST", body }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: (result, error, body) => [{ type: "Annotation", id: body.knowledge }],
        }),
        updateAnnotation: builder.mutation({
            query: ({ id, knowledgeId, ...body }) => ({
                url: `/annotations/${id}`,
                method: "PATCH",
                body,
            }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: (result, error, { knowledgeId }) => [{ type: "Annotation", id: knowledgeId }],
        }),
        deleteAnnotation: builder.mutation({
            query: ({ id }) => ({ url: `/annotations/${id}`, method: "DELETE" }),
            invalidatesTags: (result, error, { knowledgeId }) => [{ type: "Annotation", id: knowledgeId }],
        }),
    }),
});

export const {
    useGetAnnotationsQuery,
    useCreateAnnotationMutation,
    useUpdateAnnotationMutation,
    useDeleteAnnotationMutation,
} = annotationApi;
