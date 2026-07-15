import { useSelector } from "react-redux";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { useVoteCommentMutation } from "@/store/api/commentApi";

// Restrained per ADR-0007 (no gamification mechanics, docs/20-adr.md) — a
// muted numeral and two small chevrons, no color flash, no animation, no
// per-user karma total anywhere in the app. This is a content-quality
// signal (closer to Stack Overflow than a game mechanic), not a personal
// engagement reward.
export function CommentVoteButtons({ comment, knowledgeId, sort }) {
    const user = useSelector(selectCurrentUser);
    const [voteComment, { isLoading }] = useVoteCommentMutation();

    const vote = (value) => {
        if (!user) return;
        voteComment({ id: comment._id, value, knowledge: knowledgeId, sort });
    };

    return (
        <div className="flex items-center gap-0.5 text-muted-foreground">
            <button
                type="button"
                aria-label="Upvote"
                aria-pressed={comment.myVote === 1}
                disabled={!user || isLoading}
                onClick={() => vote(1)}
                className={cn(
                    "rounded p-0.5 hover:text-foreground disabled:pointer-events-none",
                    comment.myVote === 1 && "text-foreground"
                )}
            >
                <ChevronUpIcon className="size-3.5" />
            </button>
            <span className="w-4 text-center text-xs tabular-nums">{comment.score}</span>
            <button
                type="button"
                aria-label="Downvote"
                aria-pressed={comment.myVote === -1}
                disabled={!user || isLoading}
                onClick={() => vote(-1)}
                className={cn(
                    "rounded p-0.5 hover:text-foreground disabled:pointer-events-none",
                    comment.myVote === -1 && "text-foreground"
                )}
            >
                <ChevronDownIcon className="size-3.5" />
            </button>
        </div>
    );
}
