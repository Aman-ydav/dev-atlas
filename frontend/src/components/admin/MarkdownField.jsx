import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImageIcon, LoaderCircleIcon, WorkflowIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownRenderer } from "@/components/knowledge/MarkdownRenderer";
import { useUploadFileMutation } from "@/store/api/uploadApi";
import { cn } from "@/lib/utils";

// A markdown <Textarea> with a small toolbar for dropping a Cloudinary image
// or a mermaid diagram in at the cursor position, plus a rendered Preview —
// used on every field that MarkdownRenderer actually renders on the public
// side, so admins can embed media anywhere in the text instead of only in
// the single dedicated Visualization field. The textarea stays mounted (just
// visually hidden) in Preview mode so its ref/cursor position survives the
// tab switch.
export function MarkdownField({ label, value, onChange, placeholder, className = "min-h-32" }) {
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const [mode, setMode] = useState("write");
    const [uploadFile, { isLoading: uploading }] = useUploadFileMutation();

    const insertAtCursor = (snippet) => {
        setMode("write");
        const el = textareaRef.current;
        if (!el) {
            onChange(`${value || ""}${snippet}`);
            return;
        }
        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? el.value.length;
        el.focus();
        el.setRangeText(snippet, start, end, "end");
        onChange(el.value);
    };

    const handleImagePick = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        try {
            const attachment = await uploadFile(file).unwrap();
            const alt = file.name.replace(/\.[^.]+$/, "");
            insertAtCursor(`\n![${alt}](${attachment.url})\n`);
        } catch (error) {
            toast.error(error.message || "Image upload failed");
        }
    };

    const insertDiagram = () => {
        insertAtCursor("\n```mermaid\ngraph TD\n    A[Start] --> B[End]\n```\n");
    };

    return (
        <div className="space-y-1.5">
            {label && <Label>{label}</Label>}
            <div className="rounded-lg border border-input">
                <div className="flex items-center justify-between gap-2 border-b border-input px-1.5 py-1">
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? <LoaderCircleIcon className="animate-spin" /> : <ImageIcon />}
                            Image
                        </Button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                        <Button type="button" variant="ghost" size="sm" onClick={insertDiagram}>
                            <WorkflowIcon /> Diagram
                        </Button>
                    </div>
                    <Tabs value={mode} onValueChange={setMode}>
                        <TabsList className="h-7">
                            <TabsTrigger value="write" className="px-2 text-xs">Write</TabsTrigger>
                            <TabsTrigger value="preview" className="px-2 text-xs">Preview</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <Textarea
                    ref={textareaRef}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        "rounded-t-none border-none font-mono text-sm focus-visible:ring-0",
                        mode === "preview" && "hidden",
                        className
                    )}
                />
                {mode === "preview" && (
                    <div className={cn("px-3 py-2", className)}>
                        {value?.trim() ? (
                            <MarkdownRenderer content={value} />
                        ) : (
                            <p className="text-xs text-muted-foreground">Nothing to preview yet.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
