import { useMemo, useState } from "react";
import { MessagesSquareIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommentThread } from "@/components/knowledge/CommentThread";
import { CommentComposer } from "@/components/knowledge/CommentComposer";
import { useGetCommentsQuery } from "@/store/api/commentApi";

// Knowledge topic pages only, per product decision — not category pages,
// not the resources listing. Builds the reply tree client-side from one
// flat list (adjacency list by `parent`), matching the threading design in
// backend/src/models/comment.model.js.
export function CommentSection({ knowledgeId }) {
    const [sort, setSort] = useState("top");
    const { data: comments, isLoading } = useGetCommentsQuery(
        { knowledge: knowledgeId, sort },
        { skip: !knowledgeId }
    );

    const { rootComments, childrenOf, commentsById } = useMemo(() => {
        const childrenOf = {};
        const roots = [];
        const byId = {};
        for (const c of comments || []) {
            byId[c._id] = c;
            if (c.parent) {
                (childrenOf[c.parent] ||= []).push(c);
            } else {
                roots.push(c);
            }
        }
        return { rootComments: roots, childrenOf, commentsById: byId };
    }, [comments]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <MessagesSquareIcon className="size-4" />
                    Comments
                    {comments?.length > 0 && <span className="text-muted-foreground">({comments.length})</span>}
                </h2>
                <Tabs value={sort} onValueChange={setSort}>
                    <TabsList className="h-7">
                        <TabsTrigger value="top" className="px-2 text-xs">Top</TabsTrigger>
                        <TabsTrigger value="newest" className="px-2 text-xs">Newest</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <CommentComposer knowledgeId={knowledgeId} />

            {!isLoading && rootComments.length === 0 && (
                <p className="text-sm text-muted-foreground">No comments yet — be the first to add one.</p>
            )}

            <div className="divide-y divide-border">
                {rootComments.map((comment) => (
                    <CommentThread
                        key={comment._id}
                        comment={comment}
                        childrenOf={childrenOf}
                        knowledgeId={knowledgeId}
                        sort={sort}
                        commentsById={commentsById}
                    />
                ))}
            </div>
        </div>
    );
}
