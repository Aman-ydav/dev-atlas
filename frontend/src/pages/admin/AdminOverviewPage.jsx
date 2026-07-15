import { Link } from "react-router-dom";
import { PlusIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TypeBadge } from "@/components/knowledge/TypeBadge";
import { useGetKnowledgeListQuery } from "@/store/api/knowledgeApi";

export default function AdminOverviewPage() {
    const { data: drafts, isLoading: draftsLoading } = useGetKnowledgeListQuery({
        status: "draft",
        limit: 10,
        sort: "-updatedAt",
    });
    const { data: recent, isLoading: recentLoading } = useGetKnowledgeListQuery({
        limit: 10,
        sort: "-updatedAt",
    });

    return (
        <div className="space-y-8">
            <PageHeader
                title="Admin"
                description="Author and curate DevAtlas's Knowledge Cards."
                actions={
                    <Button size="sm" nativeButton={false} render={<Link to="/admin/knowledge/new" />}>
                        <PlusIcon /> New Card
                    </Button>
                }
            />

            <section>
                <h2 className="mb-3 text-sm font-semibold text-foreground">Drafts awaiting publish</h2>
                {draftsLoading && <Skeleton className="h-24 rounded-xl" />}
                {!draftsLoading && drafts?.items?.length === 0 && (
                    <p className="text-sm text-muted-foreground">No drafts — everything's published.</p>
                )}
                <div className="space-y-2">
                    {drafts?.items?.map((item) => (
                        <AdminRow key={item.slug} item={item} />
                    ))}
                </div>
            </section>

            <section>
                <h2 className="mb-3 text-sm font-semibold text-foreground">Recently updated</h2>
                {recentLoading && <Skeleton className="h-24 rounded-xl" />}
                <div className="space-y-2">
                    {recent?.items?.map((item) => (
                        <AdminRow key={item.slug} item={item} />
                    ))}
                </div>
            </section>
        </div>
    );
}

function AdminRow({ item }) {
    return (
        <Link
            to={`/knowledge/${item.slug}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-foreground/30"
        >
            <div className="flex items-center gap-2">
                <TypeBadge type={item.type} />
                <span>{item.title}</span>
            </div>
            <Badge variant={item.status === "published" ? "secondary" : "outline"}>{item.status}</Badge>
        </Link>
    );
}
