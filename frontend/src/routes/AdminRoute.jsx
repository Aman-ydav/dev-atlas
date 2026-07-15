import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAdmin } from "@/store/slices/authSlice";

// Nested under ProtectedRoute, so auth is already resolved by the time this renders.
export function AdminRoute() {
    const isAdmin = useSelector(selectIsAdmin);

    if (!isAdmin) return <Navigate to="/dashboard" replace />;

    return <Outlet />;
}
