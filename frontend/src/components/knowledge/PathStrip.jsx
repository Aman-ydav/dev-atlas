import { Link } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon, RouteIcon } from "lucide-react";
import { useGetPathsForKnowledgeQuery } from "@/store/api/learningPathApi";

// "Part of: X · Step N of M" + prev/next, rendered separately from the
// category breadcrumb — an editorial *sequence* through a subset of the
// tree, not a structural position in it. Both links are always enabled
// regardless of completion status: guidance, never a gate
// (docs/01-product-vision.md's no-gamification/no-locking principle).
export function PathStrip({ knowledgeId }) {
    const { data: paths } = useGetPathsForKnowledgeQuery(knowledgeId, { skip: !knowledgeId });

    if (!paths?.length) return null;

    return (
        <div className="space-y-2">
            {paths.map((entry) => (
                <div
                    key={entry.path.slug}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                >
                    <Link
                        to={`/paths/${entry.path.slug}`}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                        <RouteIcon className="size-3.5 shrink-0" />
                        Part of: <span className="font-medium text-foreground">{entry.path.title}</span>
                        <span>
                            · Step {entry.position} of {entry.total}
                        </span>
                    </Link>
                    <div className="flex items-center gap-1">
                        {entry.prev && (
                            <Link
                                to={`/knowledge/${entry.prev.slug}`}
                                className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:border-foreground/30"
                            >
                                <ChevronLeftIcon className="size-3" /> {entry.prev.title}
                            </Link>
                        )}
                        {entry.next && (
                            <Link
                                to={`/knowledge/${entry.next.slug}`}
                                className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:border-foreground/30"
                            >
                                {entry.next.title} <ChevronRightIcon className="size-3" />
                            </Link>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
