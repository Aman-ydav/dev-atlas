import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { RotateCcwIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KnowledgeCard } from "@/components/knowledge/KnowledgeCard";
import { RevisionControls } from "@/components/knowledge/RevisionControls";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { useGetDueForRevisionQuery } from "@/store/api/progressApi";

export default function RevisionPage() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useGetDueForRevisionQuery({ page, limit: 10 });

    return (
        <div>
            <PageHeader
                title="Revision"
                description="Everything you've marked for revision that's due right now — nothing more, nothing less."
            />

            {isLoading && (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-xl" />
                    ))}
                </div>
            )}

            {!isLoading && data?.items?.length === 0 && (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <RotateCcwIcon />
                        </EmptyMedia>
                        <EmptyTitle>You're caught up</EmptyTitle>
                        <EmptyDescription>
                            {data?.nextUp ? (
                                <>
                                    Next review {formatDistanceToNow(new Date(data.nextUp.at), { addSuffix: true })}
                                    {data.nextUp.count > 1 ? ` (${data.nextUp.count} cards queued)` : ""}.
                                </>
                            ) : (
                                "Mark a card \"for revision\" while reading it, and it'll queue up here when it's due."
                            )}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}

            {!isLoading && data?.items?.length > 0 && (
                <div className="space-y-4">
                    {data.items.map((entry) =>
                        entry.knowledge ? (
                            <div key={entry._id} className="space-y-3">
                                <KnowledgeCard knowledge={entry.knowledge} />
                                <RevisionControls knowledgeId={entry.knowledge._id} />
                            </div>
                        ) : null
                    )}

                    {data.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
                            <span>Page {data.page} of {data.totalPages}</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= data.totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
