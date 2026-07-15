import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/knowledge/CodeBlock";

const baseComponents = {
    // Fenced code blocks (```lang) get the editor-style CodeBlock wrapper;
    // inline `code` spans pass through untouched (styled via the [&_code...] rule below).
    pre: CodeBlock,
};

// Comments require no image embeds — this swaps `img` to render nothing
// rather than filtering the markdown source, so a pasted `![]()` just
// silently drops instead of needing a separate sanitize step. Image
// *styling* lives entirely in the wrapper div's Tailwind selectors below,
// not in `components`, so this doesn't risk any existing caller's rendering.
const noImageComponents = { ...baseComponents, img: () => null };

// One prose ruleset for every rendered block (tldr, explanation, mistakes,
// interview answers, project notes, comments) — this is the "one long page,
// no tabs" content typography from docs/11-design-system.md.
export function MarkdownRenderer({ content, className, disableImages = false }) {
    if (!content) return null;

    return (
        <div
            className={cn(
                "prose-content max-w-none text-[0.95rem] leading-relaxed text-foreground",
                "[&_h1]:mt-6 [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-semibold",
                "[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold",
                "[&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold",
                "[&_p]:mb-3 [&_p]:text-foreground/90",
                "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5",
                "[&_li]:mb-1",
                "[&_a]:underline [&_a]:underline-offset-4 [&_a]:text-foreground [&_a]:hover:text-muted-foreground",
                "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
                "[&_code:not(pre_code)]:rounded [&_code:not(pre_code)]:bg-[var(--code-bg)] [&_code:not(pre_code)]:px-1.5 [&_code:not(pre_code)]:py-0.5 [&_code:not(pre_code)]:font-mono [&_code:not(pre_code)]:text-[0.85em]",
                "[&_pre_code]:font-mono [&_pre_code]:text-[0.85em] [&_pre_code]:leading-relaxed",
                "[&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-border",
                "[&_table]:mb-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
                "[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-2 [&_th]:py-1 [&_th]:text-left",
                "[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1",
                "[&_hr]:my-4 [&_hr]:border-border",
                className
            )}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={disableImages ? noImageComponents : baseComponents}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
