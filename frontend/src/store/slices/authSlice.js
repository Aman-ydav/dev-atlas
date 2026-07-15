import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";
import { userApi } from "../api/userApi";

// RTK Query's cache is the source of truth for the `me` request itself, but a
// thin slice makes `isAuthenticated`/`role` selectable instantly (route
// guards, sidebar) without every consumer subscribing to useGetMeQuery.
const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        status: "idle", // idle | authenticated | unauthenticated
    },
    reducers: {
        clearAuth: (state) => {
            state.user = null;
            state.status = "unauthenticated";
        },
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, action) => {
                state.user = action.payload;
                state.status = "authenticated";
            })
            .addMatcher(authApi.endpoints.getMe.matchRejected, (state) => {
                state.user = null;
                state.status = "unauthenticated";
            })
            .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
                state.user = null;
                state.status = "unauthenticated";
            })
            .addMatcher(userApi.endpoints.updateMe.matchFulfilled, (state, action) => {
                state.user = action.payload;
            });
    },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
// "Has admin-panel access" — true for both admin and super_admin.
export const selectIsAdmin = (state) =>
    state.auth.user?.role === "admin" || state.auth.user?.role === "super_admin";
// The one capability plain admins don't have: changing anyone's role.
export const selectIsSuperAdmin = (state) => state.auth.user?.role === "super_admin";
export const selectAuthStatus = (state) => state.auth.status;
