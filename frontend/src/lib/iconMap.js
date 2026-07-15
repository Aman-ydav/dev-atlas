import * as LucideIcons from "lucide-react";

const toPascalCase = (kebab) =>
    kebab
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");

// Category.icon stores a kebab-case lucide icon name (e.g. "layout-panel-left"),
// matching lucide's own naming so it round-trips without a lookup table to maintain.
export const resolveIcon = (name) => LucideIcons[toPascalCase(name || "")] || LucideIcons.Shapes;
