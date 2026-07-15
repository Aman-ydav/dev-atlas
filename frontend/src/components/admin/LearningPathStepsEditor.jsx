import { ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { KnowledgeCombobox } from "@/components/admin/KnowledgeCombobox";

// Mirrors RepeatableRows.jsx's row-card styling (bordered card, trash
// top-right) but adds up/down reorder — steps are the one admin-editable
// array in the app where order is the whole point, and RepeatableRows has
// no reorder support. Order itself is never computed client-side: the
// server assigns fresh fractional keys from final array position on every
// save (backend/src/utils/fractionalIndex.js), so this component only ever
// deals with plain array position.
export function LearningPathStepsEditor({ steps, onChange }) {
    const rows = steps || [];

    const updateRow = (index, patch) => {
        onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
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
                <Label>Steps</Label>
                <span className="text-xs text-muted-foreground">
                    {rows.length} {rows.length === 1 ? "step" : "steps"}
                </span>
            </div>
            <div className="space-y-2">
                {rows.map((row, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-lg border border-border p-2">
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
                        <span className="w-5 shrink-0 text-center text-xs text-muted-foreground">{index + 1}</span>
                        <div className="min-w-0 flex-1">
                            <KnowledgeCombobox
                                value={row.knowledgeTitle}
                                onSelect={(item) => updateRow(index, { knowledge: item._id, knowledgeTitle: item.title })}
                            />
                        </div>
                        <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                            <Checkbox
                                checked={!!row.optional}
                                onCheckedChange={(checked) => updateRow(index, { optional: !!checked })}
                            />
                            Optional
                        </label>
                        <button
                            type="button"
                            onClick={() => removeRow(index)}
                            aria-label="Remove step"
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                            <TrashIcon className="size-3.5" />
                        </button>
                    </div>
                ))}
                {rows.length === 0 && <p className="text-xs text-muted-foreground">No steps yet.</p>}
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => onChange([...rows, { knowledge: "", knowledgeTitle: "", optional: false }])}
            >
                <PlusIcon /> Add step
            </Button>
        </div>
    );
}
