import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useGetMeQuery } from "@/store/api/authApi";
import { PageLoader } from "@/components/shared/PageLoader";

// RTK Query dedupes this against the same call made anywhere else in the
// tree (e.g. Navbar), so mounting it here doesn't cause an extra request.
export function ProtectedRoute() {
    const location = useLocation();
    const { isLoading, isError } = useGetMeQuery();

    if (isLoading) return <PageLoader />;
    if (isError) return <Navigate to="/login" replace state={{ from: location }} />;

    return <Outlet />;
}
