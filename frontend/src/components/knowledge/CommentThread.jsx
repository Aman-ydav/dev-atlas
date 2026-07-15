import { cn } from "@/lib/utils";
import { CommentItem } from "@/components/knowledge/CommentItem";

// One comment node + its children, recursively. Indentation is keyed off
// the server-computed `depth` (capped at COMMENT_MAX_DEPTH, deeper replies
// already auto-reparented onto their depth-cap ancestor server-side), not
// re-derived here.
export function CommentThread({ comment, childrenOf, knowledgeId, sort, commentsById }) {
    const replies = childrenOf[comment._id] || [];
    const showReplyingTo = comment.replyingTo && String(comment.replyingTo) !== String(comment.parent || "");
    const replyingToAuthor = showReplyingTo ? commentsById[comment.replyingTo]?.author?.name : null;

    return (
        <div className={cn(comment.depth > 0 && "ml-5 border-l border-border pl-3")}>
            <CommentItem
                comment={comment}
                knowledgeId={knowledgeId}
                sort={sort}
                replyingToAuthor={replyingToAuthor}
            />
            {replies.map((reply) => (
                <CommentThread
                    key={reply._id}
                    comment={reply}
                    childrenOf={childrenOf}
                    knowledgeId={knowledgeId}
                    sort={sort}
                    commentsById={commentsById}
                />
            ))}
        </div>
    );
}
