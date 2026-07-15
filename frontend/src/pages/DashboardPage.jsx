import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RotateCcwIcon, PinIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageLoader } from "@/components/shared/PageLoader";
import { KnowledgeCard } from "@/components/knowledge/KnowledgeCard";
import { Empty, EmptyDescription, EmptyTitle, EmptyHeader, EmptyMedia } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { useGetDashboardQuery } from "@/store/api/dashboardApi";

const Row = ({ title, items, emptyHint }) => (
    <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
        {items?.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {items.map((item) => (
                    <KnowledgeCard key={item._id || item.slug} knowledge={item} />
                ))}
            </div>
        ) : (
            <p className="text-sm text-muted-foreground">{emptyHint}</p>
        )}
    </section>
);

export default function DashboardPage() {
    const user = useSelector(selectCurrentUser);
    const { data, isLoading } = useGetDashboardQuery();

    if (isLoading) return <PageLoader />;

    return (
        <div className="space-y-8">
            <PageHeader
                title={`Welcome back${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
                description="Pick up where you left off."
            />

            {data?.revisionDueCount > 0 && (
                <Link
                    to="/revision"
                    className="flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-foreground/30"
                >
                    <RotateCcwIcon className="size-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">
                            {data.revisionDueCount} card{data.revisionDueCount === 1 ? "" : "s"} due for revision
                        </p>
                        <p className="text-xs text-muted-foreground">Go to your revision queue</p>
                    </div>
                </Link>
            )}

            {data?.pinned?.length > 0 && (
                <section>
                    <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        <PinIcon className="size-3.5" /> Pinned
                    </h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {data.pinned.map((item) => (
                            <KnowledgeCard key={item._id} knowledge={item} />
                        ))}
                    </div>
                </section>
            )}

            <Row
                title="Continue Learning"
                items={data?.continueLearning}
                emptyHint="Nothing in progress yet — open a card from Explore to get started."
            />
            <Row title="Recently Viewed" items={data?.recentlyViewed} emptyHint="Cards you view will show up here." />
            <Row title="Recently Updated on DevAtlas" items={data?.recentlyUpdated} emptyHint="Nothing published yet." />

            {(!data?.continueLearning?.length && !data?.recentlyViewed?.length) && (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <RotateCcwIcon />
                        </EmptyMedia>
                        <EmptyTitle>Your dashboard is empty</EmptyTitle>
                        <EmptyDescription>
                            Head to <Link to="/explore" className="underline underline-offset-4">Explore</Link> to start learning.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}

            {data?.stats && (
                <section className="flex gap-6 border-t border-border pt-6 text-sm text-muted-foreground">
                    <span>
                        <Badge variant="secondary" className="mr-1.5">{data.stats.totalCardsViewed}</Badge>
                        cards viewed
                    </span>
                    <span>
                        <Badge variant="secondary" className="mr-1.5">{data.stats.totalBookmarks}</Badge>
                        bookmarks
                    </span>
                    <span>
                        <Badge variant="secondary" className="mr-1.5">{data.stats.totalRevisionsDone}</Badge>
                        revisions done
                    </span>
                </section>
            )}
        </div>
    );
}
