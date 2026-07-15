import { apiSlice } from "./apiSlice";
import { unwrap, transformError } from "@/lib/apiHelpers";

export const categoryApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCategoryTree: builder.query({
            query: () => "/categories?tree=true",
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: ["Category"],
        }),
        getCategories: builder.query({
            query: (parent) => `/categories${parent !== undefined ? `?parent=${parent}` : ""}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: ["Category"],
        }),
        getCategoryBySlug: builder.query({
            query: (slug) => `/categories/${slug}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: (result, error, slug) => [{ type: "Category", id: slug }],
        }),
        createCategory: builder.mutation({
            query: (body) => ({ url: "/categories", method: "POST", body }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: ["Category"],
        }),
        updateCategory: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/categories/${id}`, method: "PATCH", body }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: ["Category"],
        }),
        deleteCategory: builder.mutation({
            query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
            invalidatesTags: ["Category"],
        }),
    }),
});

export const {
    useGetCategoryTreeQuery,
    useGetCategoriesQuery,
    useGetCategoryBySlugQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi;
