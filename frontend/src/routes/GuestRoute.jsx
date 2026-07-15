import { Navigate, Outlet } from "react-router-dom";
import { useGetMeQuery } from "@/store/api/authApi";

// For /login — already-authenticated users skip straight past it.
export function GuestRoute() {
    const { data, isLoading } = useGetMeQuery();

    if (isLoading) return null;
    if (data) return <Navigate to="/dashboard" replace />;

    return <Outlet />;
}
