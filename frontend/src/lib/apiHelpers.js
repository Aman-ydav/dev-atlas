// In dev this stays "/api/v1" (relative), which vite.config.js's server.proxy
// forwards to localhost:8000. In a split-domain deploy (static frontend on
// Vercel, API on a separate host like Render) a relative path would resolve
// against the frontend's own origin instead, so VITE_API_BASE_URL must be set
// at build time to the real API origin. Anything that talks to the backend
// outside RTK Query's apiSlice (a plain <a href>, a raw fetch) needs this
// same constant — it's not automatically covered by fixing apiSlice alone.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

// Every backend response is an ApiResponse/ApiError envelope
// ({ statusCode, success, message, data } | { success:false, message, errors }).
// RTK Query endpoints use these so components only ever see the payload.
export const unwrap = (response) => response.data;

export const transformError = (response) => ({
    status: response.status,
    message: response.data?.message || "Something went wrong",
    errors: response.data?.errors || [],
});

// Builds "?a=1&b=2" from a params object, dropping null/undefined/"" values —
// every list endpoint (knowledge, search, progress lists) shares this shape.
export const toQueryString = (params = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        search.set(key, value);
    });
    const qs = search.toString();
    return qs ? `?${qs}` : "";
};
