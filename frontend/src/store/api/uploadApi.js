import { apiSlice } from "./apiSlice";
import { unwrap, transformError } from "@/lib/apiHelpers";

export const uploadApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        uploadFile: builder.mutation({
            query: (file) => {
                const formData = new FormData();
                formData.append("file", file);
                return { url: "/uploads", method: "POST", body: formData };
            },
            transformResponse: unwrap,
            transformErrorResponse: transformError,
        }),
    }),
});

export const { useUploadFileMutation } = uploadApi;
