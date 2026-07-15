import { ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarkdownField } from "@/components/admin/MarkdownField";
import { RepeatableRows } from "@/components/admin/RepeatableRows";

const VISUALIZATION_LABEL = { none: "None", mermaid: "Mermaid diagram", flow: "Flow (advanced JSON)" };

const emptySection = () => ({
    title: "",
    body: "",
    visualization: { kind: "none", mermaidSource: "", flowJson: "" },
    codeExamples: [],
});

// A case study's ordered "chapters" — same reorder pattern as
// LearningPathStepsEditor.jsx (array position is the order, no fractional-
// key handling on the client) but each row is a rich content block instead
// of a card reference: title + markdown body + an optional headline
// visualization + code examples — the same three content shapes a
// top-level Knowledge card already has (see AdminEditorPage.jsx's own
// Explanation/Visualization/Code Examples fields), just repeated per chapter.
export function SectionsEditor({ sections, onChange }) {
    const rows = sections || [];

    const updateRow = (index, patch) => {
        onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    };

    const updateVisualization = (index, key, value) => {
        updateRow(index, { visualization: { ...rows[index].visualization, [key]: value } });
    };

    const removeRow = (index) => onChange(rows.filter((_, i) => i !== index));

    const move = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= rows.length) return;
        const next = [...rows];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <Label>Sections</Label>
                <span className="text-xs text-muted-foreground">
                    {rows.length} {rows.length === 1 ? "section" : "sections"}
                </span>
            </div>
            <div className="space-y-3">
                {rows.map((row, index) => (
                    <div key={index} className="space-y-3 rounded-lg border border-border p-3">
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                                <button
                                    type="button"
                                    aria-label="Move up"
                                    disabled={index === 0}
                                    onClick={() => move(index, -1)}
                                    className="text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                                >
                                    <ChevronUpIcon className="size-3.5" />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Move down"
                                    disabled={index === rows.length - 1}
                                    onClick={() => move(index, 1)}
                                    className="text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                                >
                                    <ChevronDownIcon className="size-3.5" />
                                </button>
                            </div>
                            <Input
                                value={row.title}
                                onChange={(e) => updateRow(index, { title: e.target.value })}
                                placeholder="Section title (e.g. Architecture, Tradeoffs, Lessons Learned)"
                                className="flex-1"
                            />
                            <button
                                type="button"
                                onClick={() => removeRow(index)}
                                aria-label="Remove section"
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                            >
                                <TrashIcon className="size-3.5" />
                            </button>
                        </div>

                        <MarkdownField label="Body" value={row.body} onChange={(v) => updateRow(index, { body: v })} className="min-h-24" />

                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Visualization (optional)</Label>
                            <Select
                                items={VISUALIZATION_LABEL}
                                value={row.visualization.kind}
                                onValueChange={(v) => updateVisualization(index, "kind", v)}
                            >
                                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(VISUALIZATION_LABEL).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {row.visualization.kind === "mermaid" && (
                                <Textarea
                                    value={row.visualization.mermaidSource}
                                    onChange={(e) => updateVisualization(index, "mermaidSource", e.target.value)}
                                    placeholder={"graph TD\n  A[Start] --> B[End]"}
                                    className="mt-2 min-h-20 font-mono text-sm"
                                />
                            )}
                            {row.visualization.kind === "flow" && (
                                <Textarea
                                    value={row.visualization.flowJson}
                                    onChange={(e) => updateVisualization(index, "flowJson", e.target.value)}
                                    placeholder='{"nodes": [], "edges": []}'
                                    className="mt-2 min-h-20 font-mono text-sm"
                                />
                            )}
                        </div>

                        <RepeatableRows
                            label="Code Examples"
                            items={row.codeExamples}
                            onChange={(v) => updateRow(index, { codeExamples: v })}
                            fields={[
                                { key: "label", label: "Label" },
                                { key: "language", label: "Language" },
                                { key: "code", label: "Code", type: "textarea" },
                            ]}
                        />
                    </div>
                ))}
                {rows.length === 0 && <p className="text-xs text-muted-foreground">No sections yet.</p>}
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => onChange([...rows, emptySection()])}
            >
                <PlusIcon /> Add section
            </Button>
        </div>
    );
}
