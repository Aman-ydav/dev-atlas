import { useState } from "react";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { PencilIcon, ReplyIcon, TrashIcon } from "lucide-react";
import { MarkdownRenderer } from "@/components/knowledge/MarkdownRenderer";
import { CommentVoteButtons } from "@/components/knowledge/CommentVoteButtons";
import { CommentComposer } from "@/components/knowledge/CommentComposer";
import { selectCurrentUser, selectIsAdmin } from "@/store/slices/authSlice";
import { useDeleteCommentMutation } from "@/store/api/commentApi";

export function CommentItem({ comment, knowledgeId, sort, replyingToAuthor }) {
    const user = useSelector(selectCurrentUser);
    const isAdmin = useSelector(selectIsAdmin);
    const [deleteComment] = useDeleteCommentMutation();
    const [replying, setReplying] = useState(false);
    const [editing, setEditing] = useState(false);

    const isOwner = !!user && String(comment.author?._id) === String(user._id);

    if (comment.isDeleted) {
        return (
            <div className="py-2 text-sm italic text-muted-foreground">
                [deleted{comment.deletedBy === "admin" ? " by moderator" : ""}]
            </div>
        );
    }

    return (
        <div className="py-2">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{comment.author?.name || "Unknown"}</span>
                <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                {comment.editedAt && <span>(edited)</span>}
                {replyingToAuthor && <span>replying to @{replyingToAuthor}</span>}
            </div>

            {editing ? (
                <CommentComposer
                    knowledgeId={knowledgeId}
                    commentId={comment._id}
                    initialValue={comment.body}
                    submitLabel="Save"
                    onCancel={() => setEditing(false)}
                    onSuccess={() => setEditing(false)}
                />
            ) : (
                <MarkdownRenderer content={comment.body} disableImages className="text-sm" />
            )}

            {!editing && (
                <div className="mt-1 flex items-center gap-3">
                    <CommentVoteButtons comment={comment} knowledgeId={knowledgeId} sort={sort} />
                    {user && (
                        <button
                            type="button"
                            onClick={() => setReplying((r) => !r)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <ReplyIcon className="size-3" /> Reply
                        </button>
                    )}
                    {isOwner && (
                        <button
                            type="button"
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <PencilIcon className="size-3" /> Edit
                        </button>
                    )}
                    {(isOwner || isAdmin) && (
                        <button
                            type="button"
                            onClick={() => deleteComment({ id: comment._id, knowledge: knowledgeId })}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                        >
                            <TrashIcon className="size-3" /> Delete
                        </button>
                    )}
                </div>
            )}

            {replying && (
                <div className="mt-2">
                    <CommentComposer
                        knowledgeId={knowledgeId}
                        parent={comment._id}
                        submitLabel="Reply"
                        onCancel={() => setReplying(false)}
                        onSuccess={() => setReplying(false)}
                    />
                </div>
            )}
        </div>
    );
}
