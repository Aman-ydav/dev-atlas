import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetMeQuery } from "@/store/api/authApi";
import { PageLoader } from "@/components/shared/PageLoader";

// Landed here straight after the OAuth provider redirect — cookies are
// already set by the backend, we just need to (re)hydrate the `me` cache
// entry (it may be stale/errored from before login) and continue in.
export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const { data, isError, refetch } = useGetMeQuery();

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (data) navigate("/", { replace: true });
        if (isError) navigate("/login?error=oauth_failed", { replace: true });
    }, [data, isError, navigate]);

    return <PageLoader />;
}
