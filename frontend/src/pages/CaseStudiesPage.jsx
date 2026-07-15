import { useMemo, useState } from "react";
import { FolderKanbanIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KnowledgeCard } from "@/components/knowledge/KnowledgeCard";
import { CaseStudyHubGroup } from "@/components/knowledge/CaseStudyHubGroup";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useGetCaseStudyHubQuery } from "@/store/api/caseStudyApi";

// A hub, not a flat reverse-chron feed: umbrella systems (e.g. an
// "Everywhere Platform" case study with an Auth System and a Notification
// System as parts, linked via the existing `part_of` relation) show as a
// group; everything else shows as a plain grid below.
export default function CaseStudiesPage() {
    const [activeTags, setActiveTags] = useState([]);
    const { data, isLoading } = useGetCaseStudyHubQuery(
        activeTags.length ? { tags: activeTags.join(",") } : undefined
    );

    const allTags = useMemo(() => {
        const all = [...(data?.groups || []).flatMap((g) => g.members), ...(data?.standalone || [])];
        return [...new Set(all.flatMap((p) => p.tags || []))].sort();
    }, [data]);

    const toggleTag = (tag) =>
        setActiveTags((tags) => (tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]));

    const isEmpty = !isLoading && (data?.groups?.length ?? 0) === 0 && (data?.standalone?.length ?? 0) === 0;

    return (
        <div>
            <PageHeader
                title="Case Studies"
                description="Engineering case studies — architecture, decisions, and lessons learned, not just a portfolio blurb."
            />

            {allTags.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-1.5">
                    {allTags.map((tag) => (
                        <button key={tag} type="button" onClick={() => toggleTag(tag)}>
                            <Badge variant={activeTags.includes(tag) ? "secondary" : "outline"}>#{tag}</Badge>
                        </button>
                    ))}
                </div>
            )}

            {isLoading && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
            )}

            {isEmpty && (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <FolderKanbanIcon />
                        </EmptyMedia>
                        <EmptyTitle>No case studies yet</EmptyTitle>
                        <EmptyDescription>Published case studies will show up here, grouped by system.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}

            <div className="space-y-8">
                {data?.groups?.map((group) => (
                    <CaseStudyHubGroup key={group.umbrella._id} group={group} />
                ))}

                {data?.standalone?.length > 0 && (
                    <section>
                        {data.groups?.length > 0 && (
                            <h2 className="mb-3 text-base font-semibold text-foreground">Other case studies</h2>
                        )}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {data.standalone.map((item) => (
                                <KnowledgeCard key={item._id} knowledge={item} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
