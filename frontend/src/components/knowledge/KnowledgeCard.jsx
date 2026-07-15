import { Link } from "react-router-dom";
import { ClockIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TypeBadge } from "@/components/knowledge/TypeBadge";
import { DifficultyBadge } from "@/components/knowledge/DifficultyBadge";

export function KnowledgeCard({ knowledge }) {
    if (!knowledge) return null;

    const { slug, title, type, category, difficulty, tags, readTimeMinutes, pattern, tagline } = knowledge;

    // Card (components/ui/card.jsx) is a plain <div> with no `render` prop support,
    // so the link has to be the outer element, not passed into Card as `render`.
    return (
        <Link to={`/knowledge/${slug}`} className="group/card block">
            <Card className="gap-3 py-4 transition-colors group-hover/card:border-foreground/20">
                <CardHeader className="px-4">
                    <div className="flex items-center gap-1.5">
                        <TypeBadge type={type} />
                        {difficulty && <DifficultyBadge difficulty={difficulty} />}
                    </div>
                    <CardTitle className="text-base font-medium leading-snug">{title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 text-xs text-muted-foreground">
                    {category?.name && <span>{category.name}</span>}
                    {pattern && <span>· {pattern}</span>}
                    {tagline && <span className="line-clamp-1">{tagline}</span>}
                    {readTimeMinutes && (
                        <span className="ml-auto flex items-center gap-1">
                            <ClockIcon className="size-3" />
                            {readTimeMinutes} min
                        </span>
                    )}
                    {tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="ghost" className="px-0 text-muted-foreground">
                            #{tag}
                        </Badge>
                    ))}
                </CardContent>
            </Card>
        </Link>
    );
}
