import { useState } from "react";
import { BookmarkIcon, HeartIcon, InfoIcon, PinIcon, XIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KnowledgeCard } from "@/components/knowledge/KnowledgeCard";
import { TYPE_META } from "@/components/knowledge/TypeBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    useGetBookmarksQuery,
    useGetFavoritesQuery,
    useGetPinnedQuery,
    useUpdateProgressMutation,
} from "@/store/api/progressApi";

export default function BookmarksPage() {
    const [tab, setTab] = useState("bookmarked");
    const [updateProgress] = useUpdateProgressMutation();

    // Bookmarks/favorites/pinned are typically a few dozen items at most, so
    // one full page grouped into sections reads better than paginating each
    // type separately — 100 is this app's existing MAX_PAGE_SIZE ceiling.
    const bookmarks = useGetBookmarksQuery({ limit: 100 });
    const favorites = useGetFavoritesQuery({ limit: 100 });
    const pinned = useGetPinnedQuery({ limit: 100 });

    const TABS = [
        { value: "bookmarked", label: "Bookmarked", icon: BookmarkIcon, field: "isBookmarked", query: bookmarks },
        { value: "favorites", label: "Favorites", icon: HeartIcon, field: "isFavorite", query: favorites },
        { value: "pinned", label: "Pinned", icon: PinIcon, field: "isPinned", query: pinned },
    ];

    return (
        <div>
            <PageHeader
                title="Saved"
                description="Everything you've bookmarked, favorited, or pinned, grouped by type. Toggle any of these from a card's own page."
            />

            <Tabs value={tab} onValueChange={setTab}>
                <div className="flex items-center gap-1.5">
                    <TabsList variant="line">
                        {TABS.map((t) => (
                            <TabsTrigger key={t.value} value={t.value}>
                                <t.icon className="size-3.5" />
                                {t.label}
                                {t.query.data?.total > 0 && (
                                    <span className="text-muted-foreground">{t.query.data.total}</span>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <Tooltip>
                        <TooltipTrigger render={<InfoIcon className="size-3.5 text-muted-foreground" />} />
                        <TooltipContent className="max-w-64">
                            Bookmark for a quick "save for later," Favorite for the ones you'd point someone else
                            to, Pin to keep it on your Dashboard. Use as many as you like — they're independent.
                        </TooltipContent>
                    </Tooltip>
                </div>
                {TABS.map((t) => (
                    <TabsContent key={t.value} value={t.value}>
                        <SavedGroup
                            isLoading={t.query.isLoading}
                            items={t.query.data?.items}
                            emptyIcon={t.icon}
                            emptyLabel={t.label}
                            removeLabel={`Remove from ${t.label.toLowerCase()}`}
                            onRemove={(knowledgeId) => updateProgress({ knowledgeId, [t.field]: false })}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

function SavedGroup({ isLoading, items, emptyIcon: Icon, emptyLabel, removeLabel, onRemove }) {
    if (isLoading) {
        return (
            <div className="space-y-3 pt-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
            </div>
        );
    }

    if (!items?.length) {
        return (
            <Empty className="pt-4">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Icon />
                    </EmptyMedia>
                    <EmptyTitle>Nothing {emptyLabel.toLowerCase()} yet</EmptyTitle>
                    <EmptyDescription>
                        Open any card and use the toolbar there to mark it — it'll show up here.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    const grouped = {};
    for (const entry of items) {
        const type = entry.knowledge?.type;
        if (!type) continue;
        (grouped[type] ??= []).push(entry);
    }

    return (
        <div className="space-y-6 pt-4">
            {Object.keys(TYPE_META)
                .filter((type) => grouped[type]?.length)
                .map((type) => (
                    <div key={type}>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {TYPE_META[type].label}s
                            <span className="ml-1 normal-case text-muted-foreground/70">({grouped[type].length})</span>
                        </h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {grouped[type].map((entry) => (
                                <div key={entry._id} className="relative">
                                    <KnowledgeCard knowledge={entry.knowledge} />
                                    <button
                                        type="button"
                                        aria-label={removeLabel}
                                        onClick={() => onRemove(entry.knowledge._id)}
                                        className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                                    >
                                        <XIcon className="size-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
        </div>
    );
}
