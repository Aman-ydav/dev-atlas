import { PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Generic "list of small objects" editor shared by codeExamples, mistakes,
// interviewQuestions, challenges, decisions — every admin-form array field
// with more than one primitive column reuses this instead of a bespoke editor.
export function RepeatableRows({ label, items, onChange, fields, addButtonLabel = "Add" }) {
    const rows = items || [];

    const updateRow = (index, key, value) => {
        const next = rows.map((row, i) => (i === index ? { ...row, [key]: value } : row));
        onChange(next);
    };

    const addRow = () => {
        const blank = Object.fromEntries(fields.map((f) => [f.key, ""]));
        onChange([...rows, blank]);
    };

    const removeRow = (index) => onChange(rows.filter((_, i) => i !== index));

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <Label>{label}</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                    <PlusIcon /> {addButtonLabel}
                </Button>
            </div>
            <div className="space-y-3">
                {rows.map((row, index) => (
                    <div key={index} className="relative space-y-2 rounded-lg border border-border p-3">
                        <button
                            type="button"
                            onClick={() => removeRow(index)}
                            aria-label="Remove"
                            className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                        >
                            <TrashIcon className="size-3.5" />
                        </button>
                        {fields.map((field) => (
                            <div key={field.key} className="space-y-1">
                                <Label className="text-xs text-muted-foreground">{field.label}</Label>
                                {field.type === "textarea" ? (
                                    <Textarea
                                        value={row[field.key] || ""}
                                        onChange={(e) => updateRow(index, field.key, e.target.value)}
                                        className="min-h-16"
                                    />
                                ) : (
                                    <Input
                                        value={row[field.key] || ""}
                                        onChange={(e) => updateRow(index, field.key, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ))}
                {rows.length === 0 && <p className="text-xs text-muted-foreground">Nothing added yet.</p>}
            </div>
        </div>
    );
}
