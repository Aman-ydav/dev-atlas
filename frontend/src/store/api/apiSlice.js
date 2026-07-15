import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({ baseUrl: "/api/v1", credentials: "include" });

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
        // in-flight refresh instead of racing concurrent calls against each
        // other (the backend rotates/invalidates the old refresh token on
        // every use, so a second concurrent refresh would find it already
        // revoked and fail).
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
