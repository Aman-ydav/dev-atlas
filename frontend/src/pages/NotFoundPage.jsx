import { Link } from "react-router-dom";
import { CompassIcon } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, EmptyContent } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
    return (
        <div className="flex min-h-svh items-center justify-center px-6">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <CompassIcon />
                    </EmptyMedia>
                    <EmptyTitle>Page not found</EmptyTitle>
                    <EmptyDescription>This card or page doesn't exist, or may have been moved.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button nativeButton={false} render={<Link to="/dashboard" />}>Back to Dashboard</Button>
                </EmptyContent>
            </Empty>
        </div>
    );
}
