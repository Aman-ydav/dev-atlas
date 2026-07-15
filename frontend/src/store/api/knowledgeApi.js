import { apiSlice } from "./apiSlice";
import { unwrap, transformError, toQueryString } from "@/lib/apiHelpers";

export const knowledgeApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getKnowledgeList: builder.query({
            query: (params) => `/knowledge${toQueryString(params)}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: (result) =>
                result
                    ? [
                          ...result.items.map((k) => ({ type: "Knowledge", id: k.slug })),
                          "KnowledgeList",
                      ]
                    : ["KnowledgeList"],
        }),
        getKnowledgeBySlug: builder.query({
            query: (slug) => `/knowledge/${slug}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: (result, error, slug) => [{ type: "Knowledge", id: slug }],
        }),
        getRelatedKnowledge: builder.query({
            query: (slug) => `/knowledge/${slug}/related`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
        }),
        createKnowledge: builder.mutation({
            query: (body) => ({ url: "/knowledge", method: "POST", body }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: ["KnowledgeList"],
        }),
        updateKnowledge: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/knowledge/${id}`, method: "PATCH", body }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: (result) => [
                "KnowledgeList",
                { type: "Knowledge", id: result?.slug },
            ],
        }),
        publishKnowledge: builder.mutation({
            query: (id) => ({ url: `/knowledge/${id}/publish`, method: "POST" }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: (result) => [
                "KnowledgeList",
                { type: "Knowledge", id: result?.slug },
            ],
        }),
        deleteKnowledge: builder.mutation({
            query: (id) => ({ url: `/knowledge/${id}`, method: "DELETE" }),
            invalidatesTags: ["KnowledgeList"],
        }),
        importDsaCsv: builder.mutation({
            query: (file) => {
                const formData = new FormData();
                formData.append("file", file);
                return { url: "/knowledge/import/dsa-csv", method: "POST", body: formData };
            },
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: ["KnowledgeList"],
        }),
    }),
});

export const {
    useGetKnowledgeListQuery,
    useGetKnowledgeBySlugQuery,
    useGetRelatedKnowledgeQuery,
    useCreateKnowledgeMutation,
    useUpdateKnowledgeMutation,
    usePublishKnowledgeMutation,
    useDeleteKnowledgeMutation,
    useImportDsaCsvMutation,
} = knowledgeApi;
