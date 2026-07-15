import { Link } from "react-router-dom";
import { toast } from "sonner";
import { TrashIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { MarkdownRenderer } from "@/components/knowledge/MarkdownRenderer";
import { useDeleteCommentMutation, useGetCommentsQuery } from "@/store/api/commentApi";

// Admin filter, not a full review queue, by design (see docs/06-database-
// design.md-equivalent reasoning in comment.controller.js's getComments) —
// a flagged comment drops out of this list once it's deleted, there's no
// separate un-flag/dismiss action.
export default function AdminCommentsPage() {
    const { data: comments, isLoading } = useGetCommentsQuery({ flagged: true });
    const [deleteComment] = useDeleteCommentMutation();

    const handleDelete = async (id, knowledge) => {
        try {
            await deleteComment({ id, knowledge }).unwrap();
            toast.success("Comment removed");
        } catch (error) {
            toast.error(error.message || "Failed to remove comment");
        }
    };

    return (
        <div className="max-w-2xl">
            <PageHeader title="Flagged Comments" description="Comments reported by users, awaiting review." />

            <div className="space-y-2">
                {comments?.map((c) => (
                    <div key={c._id} className="rounded-lg border border-border p-3">
                        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                                {c.author?.name || "Unknown"} on{" "}
                                <Link to={`/knowledge/${c.knowledge}`} className="underline underline-offset-4">
                                    this card
                                </Link>
                            </span>
                            <button type="button" onClick={() => handleDelete(c._id, c.knowledge)} aria-label="Delete">
                                <TrashIcon className="size-3.5 text-muted-foreground hover:text-destructive" />
                            </button>
                        </div>
                        {c.flagReason && <p className="mb-1 text-xs text-destructive">Reason: {c.flagReason}</p>}
                        <MarkdownRenderer content={c.body} disableImages className="text-sm" />
                    </div>
                ))}
                {!isLoading && comments?.length === 0 && <p className="text-xs text-muted-foreground">No flagged comments.</p>}
            </div>
        </div>
    );
}
