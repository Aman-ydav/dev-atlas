import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// In dev this stays "/api/v1" (relative), which vite.config.js's server.proxy
// forwards to localhost:8000. In a split-domain deploy (static frontend on
// Vercel, API on a separate host like Render) a relative path would resolve
// against the frontend's own origin instead, so VITE_API_BASE_URL — the full
// base including /api/v1 — must be set at build time to the real API origin.
const rawBaseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "/api/v1",
    credentials: "include",
});

// The access-token cookie expires in 15 minutes; the refresh-token cookie
// (10 days) is what POST /auth/refresh uses to silently mint a new pair.
// Without this wrapper, any query issued after the access token expires
// just 401s once and the caller (ProtectedRoute's getMe check) drops the
// user to /login even though a valid refresh token is sitting right there.
let refreshPromise = null;

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    const isRefreshCall = typeof args === "object" && args.url === "/auth/refresh";
    if (result.error?.status === 401 && !isRefreshCall) {
        // Several queries can 401 at once when the token expires — share one
        // in-flight refresh instead of firing one /auth/refresh call per
        // query. Not a correctness fix (the backend doesn't rotate the
        // refresh token on refresh, so redundant calls would just succeed
        // too) — this purely avoids wasted duplicate round-trips.
        refreshPromise ??= rawBaseQuery({ url: "/auth/refresh", method: "POST" }, api, extraOptions).finally(() => {
            refreshPromise = null;
        });
        const refreshResult = await refreshPromise;

        if (refreshResult.data) {
            result = await rawBaseQuery(args, api, extraOptions);
        }
    }

    return result;
};

// Single RTK Query surface for the whole app — every feature api file below
// injects its endpoints into this one instance (one cache, one middleware).
// credentials:"include" carries the httpOnly accessToken/refreshToken cookies;
// the /api proxy in vite.config.js keeps this same-origin in dev.
export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
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
