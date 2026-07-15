import { useState } from "react";
import { BookmarkIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KnowledgeCard } from "@/components/knowledge/KnowledgeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { useGetBookmarksQuery } from "@/store/api/progressApi";

export default function BookmarksPage() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useGetBookmarksQuery({ page, limit: 12 });

    return (
        <div>
            <PageHeader title="Bookmarks" description="Cards you've saved for later." />

            {isLoading && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
            )}

            {!isLoading && data?.items?.length === 0 && (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <BookmarkIcon />
                        </EmptyMedia>
                        <EmptyTitle>No bookmarks yet</EmptyTitle>
                        <EmptyDescription>Bookmark a card while reading it and it'll show up here.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}

            {!isLoading && data?.items?.length > 0 && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {data.items.map((entry) =>
                            entry.knowledge ? <KnowledgeCard key={entry._id} knowledge={entry.knowledge} /> : null
                        )}
                    </div>
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
