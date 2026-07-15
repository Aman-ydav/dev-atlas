import { Link } from "react-router-dom";
import { toast } from "sonner";
import { PlusIcon, TrashIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeleteLearningPathMutation, useGetLearningPathsQuery } from "@/store/api/learningPathApi";

export default function AdminLearningPathsPage() {
    const { data: paths } = useGetLearningPathsQuery();
    const [deleteLearningPath] = useDeleteLearningPathMutation();

    const handleDelete = async (id) => {
        try {
            await deleteLearningPath(id).unwrap();
            toast.success("Learning path deleted");
        } catch (error) {
            toast.error(error.message || "Failed to delete learning path");
        }
    };

    return (
        <div className="max-w-2xl">
            <PageHeader
                title="Learning Paths"
                description="Ordered, curated sequences through existing cards — guidance, not a gate. Every step stays directly browsable regardless of a path."
                actions={
                    <Button render={<Link to="/admin/learning-paths/new" />}>
                        <PlusIcon /> New path
                    </Button>
                }
            />

            <div className="space-y-1">
                {paths?.map((path) => (
                    <div
                        key={path._id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                    >
                        <Link to={`/admin/learning-paths/${path.slug}/edit`} className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="truncate font-medium">{path.title}</span>
                                <Badge variant={path.published ? "secondary" : "outline"}>
                                    {path.published ? "Published" : "Draft"}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {path.stepCount} {path.stepCount === 1 ? "step" : "steps"}
                                {path.category?.name && ` · ${path.category.name}`}
                            </p>
                        </Link>
                        <button
                            type="button"
                            onClick={() => handleDelete(path._id)}
                            aria-label="Delete"
                            className="shrink-0"
                        >
                            <TrashIcon className="size-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                    </div>
                ))}
                {paths?.length === 0 && <p className="text-xs text-muted-foreground">No learning paths yet.</p>}
            </div>
        </div>
    );
}
