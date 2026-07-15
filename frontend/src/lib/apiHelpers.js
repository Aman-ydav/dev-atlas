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
