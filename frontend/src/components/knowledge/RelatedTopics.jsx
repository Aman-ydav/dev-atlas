import { Link } from "react-router-dom";
import { useGetRelatedKnowledgeQuery } from "@/store/api/knowledgeApi";
import { TypeBadge } from "@/components/knowledge/TypeBadge";

const RELATION_LABEL = {
    related_to: "Related to",
    depends_on: "Depends on",
    used_in: "Used in",
    implements: "Implements",
    alternative: "Alternative to",
    prerequisite: "Prerequisite",
    example_of: "Example of",
    part_of: "Part of",
    referenced_by: "Referenced by",
};

export function RelatedTopics({ slug }) {
    const { data, isLoading } = useGetRelatedKnowledgeQuery(slug, { skip: !slug });

    if (isLoading || !data || Object.keys(data).length === 0) return null;

    return (
        <div className="space-y-4">
            {Object.entries(data).map(([relationType, items]) => (
                <div key={relationType}>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                        {RELATION_LABEL[relationType] || relationType}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {items.map((item) => (
                            <Link
                                key={item.slug}
                                to={`/knowledge/${item.slug}`}
                                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm transition-colors hover:border-foreground/30"
                            >
                                <TypeBadge type={item.type} className="h-4" />
                                {item.title}
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
