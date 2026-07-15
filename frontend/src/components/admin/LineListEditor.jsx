import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Simple "one item per line" editor for plain string-array fields
// (hints, lessonsLearned, improvements, techStack, followUps...).
export function LineListEditor({ label, value, onChange, placeholder }) {
    const text = (value || []).join("\n");

    return (
        <div className="space-y-1">
            {label && <Label className="text-xs text-muted-foreground">{label}</Label>}
            <Textarea
                value={text}
                placeholder={placeholder}
                onChange={(e) =>
                    onChange(e.target.value.split("\n").map((line) => line.trim()).filter(Boolean))
                }
                className="min-h-16"
            />
        </div>
    );
}
