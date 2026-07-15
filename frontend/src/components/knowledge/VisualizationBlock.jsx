import { Suspense, lazy } from "react";
import { MermaidDiagram } from "@/components/knowledge/MermaidDiagram";
import { Skeleton } from "@/components/ui/skeleton";

// @xyflow/react (+ its CSS) is one of the heaviest deps in the app and only
// needed on cards that actually use a flow-kind visualization — code-split it.
const FlowDiagram = lazy(() =>
    import("@/components/knowledge/FlowDiagram").then((m) => ({ default: m.FlowDiagram }))
);

export function VisualizationBlock({ visualization }) {
    if (!visualization || visualization.kind === "none") return null;

    if (visualization.kind === "mermaid") {
        return <MermaidDiagram source={visualization.mermaidSource} />;
    }

    if (visualization.kind === "flow") {
        return (
            <Suspense fallback={<Skeleton className="h-80 rounded-lg" />}>
                <FlowDiagram flow={visualization.flow} />
            </Suspense>
        );
    }

    return null;
}
