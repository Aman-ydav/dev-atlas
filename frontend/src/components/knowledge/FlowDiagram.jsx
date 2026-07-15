import { ReactFlow, Background, Controls, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Read-only viewer for the admin-authored { nodes, edges } flow JSON.
// The draggable *editing* canvas lives in the admin editor, not here.
export function FlowDiagram({ flow }) {
    if (!flow?.nodes?.length) return null;

    return (
        <div className="h-80 overflow-hidden rounded-lg border border-border">
            <ReactFlowProvider>
                <ReactFlow
                    nodes={flow.nodes}
                    edges={flow.edges || []}
                    fitView
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background gap={16} size={1} />
                    <Controls showInteractive={false} />
                </ReactFlow>
            </ReactFlowProvider>
        </div>
    );
}
