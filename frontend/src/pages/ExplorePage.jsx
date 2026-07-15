import { Link } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveIcon } from "@/lib/iconMap";
import { useGetCategoryTreeQuery } from "@/store/api/categoryApi";

export default function ExplorePage() {
    const { data: categories, isLoading } = useGetCategoryTreeQuery();

    return (
        <div>
            <PageHeader
                title="Explore"
                description="Browse everything you know, organized by category — not by folder."
            />

            {isLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {categories?.map((category) => {
                        const Icon = resolveIcon(category.icon);
                        return (
                            <Link key={category._id} to={`/explore/${category.slug}`} className="group/card block">
                                <Card className="gap-2 py-4 transition-colors group-hover/card:border-foreground/20">
                                    <CardContent className="flex flex-col items-start gap-2 px-4">
                                        <Icon className="size-5 text-muted-foreground" />
                                        <span className="text-sm font-medium">{category.name}</span>
                                        {category.children?.length > 0 && (
                                            <span className="text-xs text-muted-foreground">
                                                {category.children.length} subcategories
                                            </span>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
