import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

const extractText = (node) => {
    if (typeof node === "string") return node;
    if (typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (node?.props?.children != null) return extractText(node.props.children);
    return "";
};

// Overrides react-markdown's default <pre><code> for fenced code blocks —
// adds the language label + copy button a real editor/doc site has, which
// no amount of CSS on the plain <pre> tag alone can provide.
export function CodeBlock({ children }) {
    const [copied, setCopied] = useState(false);
    const codeElement = Array.isArray(children) ? children[0] : children;
    const className = codeElement?.props?.className || "";
    const language = /language-(\w+)/.exec(className)?.[1] || "text";

    const handleCopy = async () => {
        await navigator.clipboard.writeText(extractText(codeElement));
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="mb-3 overflow-hidden rounded-lg border border-(--code-editor-border) bg-(--code-editor-bg) shadow-(--shadow)">
            <div className="flex items-center justify-between border-b border-(--code-editor-border) px-3.5 py-1.5">
                <span className="font-mono text-xs text-(--code-editor-comment)">{language}</span>
                <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Copy code"
                    className="flex items-center gap-1 text-xs text-(--code-editor-fg)/60 transition-colors hover:text-(--code-editor-fg)"
                >
                    {copied ? (
                        <>
                            <CheckIcon className="size-3.5" /> Copied
                        </>
                    ) : (
                        <>
                            <CopyIcon className="size-3.5" /> Copy
                        </>
                    )}
                </button>
            </div>
            <pre className="overflow-x-auto p-3.5 text-(--code-editor-fg)">{children}</pre>
        </div>
    );
}
