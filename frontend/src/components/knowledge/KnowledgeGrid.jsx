import { InboxIcon } from "lucide-react";
import { KnowledgeCard } from "@/components/knowledge/KnowledgeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { useGetKnowledgeListQuery } from "@/store/api/knowledgeApi";

export function KnowledgeGrid({ params, onPageChange }) {
    const { data, isLoading, isFetching } = useGetKnowledgeListQuery(params);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
        );
    }

    if (!data || data.items.length === 0) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <InboxIcon />
                    </EmptyMedia>
                    <EmptyTitle>Nothing here yet</EmptyTitle>
                    <EmptyDescription>
                        No knowledge cards match these filters. Try widening the filters or check back later.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <div className="space-y-4" aria-busy={isFetching}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {data.items.map((item) => (
                    <KnowledgeCard key={item.slug} knowledge={item} />
                ))}
            </div>

            {data.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
                    <span>
                        Page {data.page} of {data.totalPages} · {data.total} cards
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={data.page <= 1}
                            onClick={() => onPageChange(data.page - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={data.page >= data.totalPages}
                            onClick={() => onPageChange(data.page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
