import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/knowledge/MarkdownRenderer";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { useCreateCommentMutation, useUpdateCommentMutation } from "@/store/api/commentApi";

// A lightweight Write/Preview composer, deliberately NOT MarkdownField —
// that component ships an Image/Diagram insert toolbar wired to file
// uploads, exactly the embed capability comments must not have. Doubles as
// the edit form: passing `commentId` switches submit from create to update.
export function CommentComposer({ knowledgeId, parent = null, commentId = null, initialValue = "", submitLabel, onCancel, onSuccess }) {
    const user = useSelector(selectCurrentUser);
    const [body, setBody] = useState(initialValue);
    const [mode, setMode] = useState("write");
    const [createComment, { isLoading: creating }] = useCreateCommentMutation();
    const [updateComment, { isLoading: updating }] = useUpdateCommentMutation();

    if (!user) {
        return <p className="text-sm text-muted-foreground">Sign in to comment.</p>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!body.trim()) return;

        try {
            if (commentId) {
                await updateComment({ id: commentId, knowledge: knowledgeId, body }).unwrap();
            } else {
                await createComment({ knowledge: knowledgeId, parent, body }).unwrap();
                setBody("");
            }
            onSuccess?.();
        } catch (error) {
            toast.error(error.message || "Failed to save comment");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <div className="rounded-lg border border-input">
                <div className="flex items-center justify-between border-b border-input px-1.5 py-1">
                    <Tabs value={mode} onValueChange={setMode}>
                        <TabsList className="h-7">
                            <TabsTrigger value="write" className="px-2 text-xs">Write</TabsTrigger>
                            <TabsTrigger value="preview" className="px-2 text-xs">Preview</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <span className="pr-1.5 text-[0.65rem] text-muted-foreground">Markdown, no images</span>
                </div>
                {mode === "write" ? (
                    <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Add to the discussion..."
                        className="min-h-20 rounded-t-none border-none font-mono text-sm focus-visible:ring-0"
                    />
                ) : (
                    <div className="min-h-20 px-3 py-2">
                        {body.trim() ? (
                            <MarkdownRenderer content={body} disableImages className="text-sm" />
                        ) : (
                            <p className="text-xs text-muted-foreground">Nothing to preview yet.</p>
                        )}
                    </div>
                )}
            </div>
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" size="sm" disabled={creating || updating || !body.trim()}>
                    {submitLabel || (commentId ? "Save" : "Comment")}
                </Button>
            </div>
        </form>
    );
}
