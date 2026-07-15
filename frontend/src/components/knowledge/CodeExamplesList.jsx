import { MarkdownRenderer } from "@/components/knowledge/MarkdownRenderer";

export function CodeExamplesList({ examples }) {
    if (!examples?.length) return null;

    return (
        <div className="space-y-4">
            {examples.map((example, index) => (
                <div key={index}>
                    {example.label && (
                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">{example.label}</p>
                    )}
                    <MarkdownRenderer
                        content={"```" + (example.language || "") + "\n" + (example.code || "") + "\n```"}
                    />
                </div>
            ))}
        </div>
    );
}
