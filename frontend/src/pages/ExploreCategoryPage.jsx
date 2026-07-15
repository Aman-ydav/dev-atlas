import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { KnowledgeGrid } from "@/components/knowledge/KnowledgeGrid";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/shared/PageLoader";
import { useGetCategoryBySlugQuery } from "@/store/api/categoryApi";

export default function ExploreCategoryPage() {
    const { categorySlug } = useParams();
    const { data: category, isLoading } = useGetCategoryBySlugQuery(categorySlug);
    const [activeChild, setActiveChild] = useState(null);
    const [page, setPage] = useState(1);

    if (isLoading) return <PageLoader />;
    if (!category) return null;

    // "All" means this category AND its subcategories — most content is tagged
    // to the specific subcategory (e.g. JavaScript), not the parent (Frontend),
    // so filtering by the parent id alone would show nothing.
    const categoryFilter = activeChild
        ? activeChild
        : [category._id, ...(category.children || []).map((c) => c._id)].join(",");

    return (
        <div>
            <PageHeader title={category.name} description={category.description} />

            {category.children?.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                    <Badge
                        variant={!activeChild ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                            setActiveChild(null);
                            setPage(1);
                        }}
                    >
                        All
                    </Badge>
                    {category.children.map((child) => (
                        <Badge
                            key={child._id}
                            variant={activeChild === child._id ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                                setActiveChild(child._id);
                                setPage(1);
                            }}
                        >
                            {child.name}
                        </Badge>
                    ))}
                </div>
            )}

            <KnowledgeGrid params={{ category: categoryFilter, page, limit: 12 }} onPageChange={setPage} />

            <p className="mt-6 text-center text-xs text-muted-foreground">
                Looking for something else?{" "}
                <Link to="/explore" className="underline underline-offset-4">
                    Back to Explore
                </Link>
            </p>
        </div>
    );
}
