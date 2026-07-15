import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/shared/GoogleIcon";
import { GithubIcon } from "@/components/shared/GithubIcon";
import { useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "@/lib/apiHelpers";

export default function LoginPage() {
    const [searchParams] = useSearchParams();
    const oauthFailed = searchParams.get("error") === "oauth_failed";

    return (
        <div className="flex min-h-svh w-full items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-sm rounded-xl border border-border p-8"
            >
                <div className="mb-8 flex flex-col items-center gap-2 text-center">
                    <span className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                        DA
                    </span>
                    <h1 className="text-lg font-semibold text-foreground">Sign in to DevAtlas</h1>
                    <p className="text-sm text-muted-foreground">
                        Your engineering knowledge, in one connected system.
                    </p>
                </div>

                {oauthFailed && (
                    <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
                        Sign-in failed. Please try again.
                    </p>
                )}

                <div className="flex flex-col gap-2">
                    <Button variant="outline" size="lg" className="w-full justify-center" nativeButton={false} render={<a href={`${API_BASE_URL}/auth/google`} />}>
                        <GoogleIcon className="size-4" />
                        Continue with Google
                    </Button>
                    <Button variant="outline" size="lg" className="w-full justify-center" nativeButton={false} render={<a href={`${API_BASE_URL}/auth/github`} />}>
                        <GithubIcon className="size-4" />
                        Continue with GitHub
                    </Button>
                </div>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    No passwords, ever — DevAtlas signs you in with your existing Google or GitHub account.
                </p>
            </motion.div>
        </div>
    );
}
