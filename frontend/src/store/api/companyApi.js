import { apiSlice } from "./apiSlice";
import { unwrap, transformError } from "@/lib/apiHelpers";

export const companyApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCompanies: builder.query({
            query: (q) => `/companies${q ? `?q=${encodeURIComponent(q)}` : ""}`,
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            providesTags: ["Company"],
        }),
        createCompany: builder.mutation({
            query: (body) => ({ url: "/companies", method: "POST", body }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: ["Company"],
        }),
        updateCompany: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/companies/${id}`, method: "PATCH", body }),
            transformResponse: unwrap,
            transformErrorResponse: transformError,
            invalidatesTags: ["Company"],
        }),
        deleteCompany: builder.mutation({
            query: (id) => ({ url: `/companies/${id}`, method: "DELETE" }),
            invalidatesTags: ["Company"],
        }),
    }),
});

export const {
    useGetCompaniesQuery,
    useCreateCompanyMutation,
    useUpdateCompanyMutation,
    useDeleteCompanyMutation,
} = companyApi;
