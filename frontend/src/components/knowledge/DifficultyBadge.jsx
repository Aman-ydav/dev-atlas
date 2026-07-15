import { Badge } from "@/components/ui/badge";

export const DIFFICULTY_LABEL = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
};

export function DifficultyBadge({ difficulty, className }) {
    return (
        <Badge variant="secondary" className={className}>
            {DIFFICULTY_LABEL[difficulty] || difficulty}
        </Badge>
    );
}
