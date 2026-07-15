import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { XIcon } from "lucide-react";
import { MarkdownRenderer } from "@/components/knowledge/MarkdownRenderer";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { selectCurrentUser } from "@/store/slices/authSlice";
import {
    useCreateAnnotationMutation,
    useDeleteAnnotationMutation,
    useGetAnnotationsQuery,
} from "@/store/api/annotationApi";

// Mirrors backend/src/constants.js HIGHLIGHT_COLORS. Each name is a
// .highlight-{name} class in index.css (a bg/fg token pair that swaps with
// .dark) instead of an inline hex — see docs/11-design-system.md §2.9 for
// why that swap matters (it's what fixes highlighted text being unreadable
// in dark mode: a hardcoded background with `color: inherit` used to pick
// up --foreground, which is near-white in dark mode, on a light pastel bg).
const HIGHLIGHT_COLORS = ["yellow", "green", "blue", "pink", "purple", "orange"];
const HIGHLIGHT_LABEL = {
    yellow: "Yellow",
    green: "Green",
    blue: "Blue",
    pink: "Pink",
    purple: "Purple",
    orange: "Orange",
};
const highlightClass = (color) =>
    `highlight-mark highlight-${HIGHLIGHT_COLORS.includes(color) ? color : "yellow"}`;

// Highlights are anchored by exact-quote text matching (not DOM offsets) —
// robust across re-renders at the cost of not handling duplicate substrings
// separately. See docs/06-database-design.md §6 for the full anchoring note.
const wrapQuotesInDom = (container, annotations) => {
    container.querySelectorAll("mark[data-annotation-id]").forEach((mark) => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
    });

    annotations.forEach((annotation) => {
        if (!annotation.quote?.trim()) return;
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        while (node) {
            const index = node.textContent.indexOf(annotation.quote);
            if (index !== -1) {
                const range = document.createRange();
                range.setStart(node, index);
                range.setEnd(node, index + annotation.quote.length);
                const mark = document.createElement("mark");
                mark.dataset.annotationId = annotation._id;
                mark.title = annotation.note || "";
                mark.className = highlightClass(annotation.color);
                try {
                    range.surroundContents(mark);
                } catch {
                    // selection crossed element boundaries — skip, best-effort only
                }
                break;
            }
            node = walker.nextNode();
        }
    });
};

export function HighlightableContent({ knowledgeId, block, content }) {
    const containerRef = useRef(null);
    const user = useSelector(selectCurrentUser);
    const { data: annotations } = useGetAnnotationsQuery(knowledgeId, { skip: !user || !knowledgeId });
    const [createAnnotation] = useCreateAnnotationMutation();
    const [deleteAnnotation] = useDeleteAnnotationMutation();
    const [selectionToolbar, setSelectionToolbar] = useState(null);

    const blockAnnotations = useMemo(
        () => (annotations || []).filter((a) => a.block === block),
        [annotations, block]
    );

    useEffect(() => {
        if (containerRef.current) wrapQuotesInDom(containerRef.current, blockAnnotations);
    }, [blockAnnotations, content]);

    const handleMouseUp = () => {
        if (!user) return;
        const selection = window.getSelection();
        const text = selection?.toString().trim();
        if (!text || !containerRef.current?.contains(selection.anchorNode)) {
            setSelectionToolbar(null);
            return;
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        setSelectionToolbar({
            quote: text,
            top: rect.top - containerRect.top - 40,
            left: Math.max(rect.left - containerRect.left, 0),
        });
    };

    const applyHighlight = async (color) => {
        if (!selectionToolbar) return;
        await createAnnotation({
            knowledge: knowledgeId,
            block,
            quote: selectionToolbar.quote,
            color,
        });
        window.getSelection()?.removeAllRanges();
        setSelectionToolbar(null);
    };

    return (
        <div className="relative">
            {selectionToolbar && (
                <div
                    className="absolute z-10 flex items-center gap-1 rounded-full border border-border bg-popover p-1 shadow-(--shadow)"
                    style={{ top: selectionToolbar.top, left: selectionToolbar.left }}
                >
                    {HIGHLIGHT_COLORS.map((name) => (
                        <Tooltip key={name}>
                            <TooltipTrigger
                                render={
                                    <button
                                        type="button"
                                        aria-label={`Highlight ${HIGHLIGHT_LABEL[name]}`}
                                        className={cn(
                                            "size-5 rounded-full border border-border transition-transform hover:scale-110 active:scale-95",
                                            `highlight-${name}`
                                        )}
                                        onClick={() => applyHighlight(name)}
                                    />
                                }
                            />
                            <TooltipContent>{HIGHLIGHT_LABEL[name]}</TooltipContent>
                        </Tooltip>
                    ))}
                    <button
                        type="button"
                        aria-label="Cancel"
                        className="ml-0.5 flex size-5 items-center justify-center text-muted-foreground"
                        onClick={() => setSelectionToolbar(null)}
                    >
                        <XIcon className="size-3.5" />
                    </button>
                </div>
            )}

            <div ref={containerRef} onMouseUp={handleMouseUp}>
                <MarkdownRenderer content={content} />
            </div>

            {blockAnnotations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-dashed border-border pt-3">
                    {blockAnnotations.map((annotation) => (
                        <span
                            key={annotation._id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
                        >
                            <span className={cn("size-2 rounded-full", `highlight-${HIGHLIGHT_COLORS.includes(annotation.color) ? annotation.color : "yellow"}`)} />
                            <span className="max-w-40 truncate">"{annotation.quote}"</span>
                            <button
                                type="button"
                                aria-label="Remove highlight"
                                onClick={() => deleteAnnotation({ id: annotation._id, knowledgeId })}
                            >
                                <XIcon className="size-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
