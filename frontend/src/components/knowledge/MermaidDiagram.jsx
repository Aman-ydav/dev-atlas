import { useEffect, useId, useState } from "react";

let mermaidPromise = null;
// mermaid pulls in a parser+renderer per diagram type and is one of the
// heaviest deps in the app — load it only when a mermaid block actually renders.
const loadMermaid = () => {
    if (!mermaidPromise) {
        mermaidPromise = import("mermaid").then(({ default: mermaid }) => {
            // Neutral, low-saturation theme to match the no-gradient/no-glow design system.
            mermaid.initialize({
                startOnLoad: false,
                theme: "base",
                themeVariables: {
                    primaryColor: "#f4f3ec",
                    primaryTextColor: "#08060d",
                    primaryBorderColor: "#6b6375",
                    lineColor: "#6b6375",
                    secondaryColor: "#f4f3ec",
                    tertiaryColor: "#ffffff",
                    fontFamily: "system-ui, Segoe UI, Roboto, sans-serif",
                },
            });
            return mermaid;
        });
    }
    return mermaidPromise;
};

export function MermaidDiagram({ source }) {
    const id = useId().replace(/:/g, "");
    const [svg, setSvg] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!source?.trim()) return;
        let cancelled = false;

        loadMermaid()
            .then((mermaid) => mermaid.render(`mermaid-${id}`, source))
            .then(({ svg }) => {
                if (!cancelled) setSvg(svg);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message);
            });

        return () => {
            cancelled = true;
        };
    }, [source, id]);

    if (!source?.trim()) return null;
    if (error) {
        return <p className="text-xs text-destructive">Couldn't render diagram: {error}</p>;
    }

    return (
        <div
            className="overflow-x-auto rounded-lg border border-border bg-card p-4 [&_svg]:mx-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
