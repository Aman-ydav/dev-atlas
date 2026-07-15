import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Single RTK Query surface for the whole app — every feature api file below
// injects its endpoints into this one instance (one cache, one middleware).
// credentials:"include" carries the httpOnly accessToken/refreshToken cookies;
// the /api proxy in vite.config.js keeps this same-origin in dev.
export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1", credentials: "include" }),
    tagTypes: [
        "Me",
        "Knowledge",
        "KnowledgeList",
        "Category",
        "Company",
        "Resource",
        "Progress",
        "ProgressList",
        "Annotation",
        "Dashboard",
        "User",
    ],
    endpoints: () => ({}),
});
