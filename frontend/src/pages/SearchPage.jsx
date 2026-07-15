import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KnowledgeCard } from "@/components/knowledge/KnowledgeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { useSearchQuery } from "@/store/api/searchApi";

const TYPES = ["concept", "dsa", "interview", "project"];

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "";
    const [draft, setDraft] = useState(q);
    const [page, setPage] = useState(1);

    const { data, isFetching } = useSearchQuery({ q, type: type || undefined, page, limit: 12 }, { skip: !q.trim() });

    const submit = (e) => {
        e.preventDefault();
        setSearchParams(draft.trim() ? { q: draft.trim(), ...(type ? { type } : {}) } : {});
        setPage(1);
    };

    const setType = (nextType) => {
        const next = { q };
        if (nextType) next.type = nextType;
        setSearchParams(next);
        setPage(1);
    };

    return (
        <div>
            <PageHeader title="Search" description="Search across concepts, DSA, interview prep, and projects — one index, everything connected." />

            <form onSubmit={submit} className="mb-4 flex gap-2">
                <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Search DevAtlas..."
                    autoFocus
                />
                <Button type="submit">
                    <SearchIcon /> Search
                </Button>
            </form>

            {q && (
                <div className="mb-6 flex flex-wrap gap-2">
                    <Badge variant={!type ? "default" : "outline"} className="cursor-pointer" onClick={() => setType("")}>
                        All {data?.total !== undefined && `(${data.total})`}
                    </Badge>
                    {TYPES.map((t) => (
                        <Badge
                            key={t}
                            variant={type === t ? "default" : "outline"}
                            className="cursor-pointer capitalize"
                            onClick={() => setType(t)}
                        >
                            {t} {data?.facets?.[t] ? `(${data.facets[t]})` : ""}
                        </Badge>
                    ))}
                </div>
            )}

            {!q.trim() && (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <SearchIcon />
                        </EmptyMedia>
                        <EmptyTitle>Search everything you know</EmptyTitle>
                        <EmptyDescription>Try "JWT", "two pointers", or a project name.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}

            {q.trim() && isFetching && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
            )}

            {q.trim() && !isFetching && data?.items?.length === 0 && (
                <Empty>
                    <EmptyHeader>
                        <EmptyTitle>No results for "{q}"</EmptyTitle>
                        <EmptyDescription>Try a different term or clear the type filter.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}

            {q.trim() && !isFetching && data?.items?.length > 0 && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {data.items.map((item) => (
                            <KnowledgeCard key={item.slug} knowledge={item} />
                        ))}
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
