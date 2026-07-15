import { BookOpenIcon, BinaryIcon, MessageSquareTextIcon, FolderKanbanIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TYPE_META = {
    concept: { label: "Concept", icon: BookOpenIcon },
    dsa: { label: "DSA", icon: BinaryIcon },
    interview: { label: "Interview", icon: MessageSquareTextIcon },
    project: { label: "Project", icon: FolderKanbanIcon },
};

export function TypeBadge({ type, className }) {
    const meta = TYPE_META[type] || TYPE_META.concept;
    const Icon = meta.icon;

    return (
        <Badge variant="outline" className={className}>
            <Icon />
            {meta.label}
        </Badge>
    );
}
