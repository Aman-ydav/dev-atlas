import { Link, useParams } from "react-router-dom";
import { CheckCircle2Icon, CircleIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageLoader } from "@/components/shared/PageLoader";
import { Badge } from "@/components/ui/badge";
import { TypeBadge } from "@/components/knowledge/TypeBadge";
import { useGetLearningPathBySlugQuery } from "@/store/api/learningPathApi";

// Every step is a plain, always-clickable link — a checkmark reflects this
// reader's own progress, it never locks a later step. See PathStrip.jsx for
// the same principle applied on the individual knowledge page.
export default function LearningPathDetailPage() {
    const { slug } = useParams();
    const { data: path, isLoading } = useGetLearningPathBySlugQuery(slug);

    if (isLoading) return <PageLoader />;
    if (!path) return null;

    return (
        <div className="max-w-2xl">
            <PageHeader
                title={path.title}
                description={path.description}
                actions={path.category?.name ? <Badge variant="ghost">{path.category.name}</Badge> : undefined}
            />

            <div className="space-y-1">
                {path.steps.map((step, i) => (
                    <Link
                        key={step._id}
                        to={step.knowledge ? `/knowledge/${step.knowledge.slug}` : "#"}
                        className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:border-foreground/30"
                    >
                        {step.status === "completed" ? (
                            <CheckCircle2Icon className="size-4 shrink-0 text-muted-foreground" />
                        ) : (
                            <CircleIcon className="size-4 shrink-0 text-muted-foreground/40" />
                        )}
                        <span className="w-5 shrink-0 text-xs text-muted-foreground">{i + 1}</span>
                        <p className="min-w-0 flex-1 truncate font-medium">{step.knowledge?.title || "Removed card"}</p>
                        {step.knowledge && <TypeBadge type={step.knowledge.type} className="shrink-0" />}
                        {step.optional && <Badge variant="outline" className="shrink-0">Optional</Badge>}
                    </Link>
                ))}
                {path.steps.length === 0 && <p className="text-xs text-muted-foreground">No steps yet.</p>}
            </div>
        </div>
    );
}
