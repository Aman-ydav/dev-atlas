import { Link } from "react-router-dom";
import { RouteIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useGetLearningPathsQuery } from "@/store/api/learningPathApi";

export default function LearningPathsPage() {
    const { data: paths, isLoading } = useGetLearningPathsQuery();

    return (
        <div>
            <PageHeader
                title="Learning Paths"
                description="Curated, step-by-step sequences through the knowledge base — a guide, not a gate. Every card inside a path is still freely browsable on its own."
            />

            {isLoading && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
            )}

            {!isLoading && (paths?.length ?? 0) === 0 && (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <RouteIcon />
                        </EmptyMedia>
                        <EmptyTitle>No learning paths yet</EmptyTitle>
                        <EmptyDescription>Curated sequences added by admins will show up here.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {paths?.map((path) => (
                    <Link key={path._id} to={`/paths/${path.slug}`} className="group/card block">
                        <Card className="gap-1 py-4 transition-colors group-hover/card:border-foreground/20">
                            <CardContent className="px-4">
                                <div className="mb-1 flex items-center gap-2">
                                    <RouteIcon className="size-3.5 text-muted-foreground" />
                                    <p className="text-sm font-medium">{path.title}</p>
                                </div>
                                {path.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{path.description}</p>
                                )}
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {path.stepCount} {path.stepCount === 1 ? "step" : "steps"}
                                    {path.category?.name && ` · ${path.category.name}`}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
