import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useGetCategoryTreeQuery } from "@/store/api/categoryApi";
import { useGetCompaniesQuery } from "@/store/api/companyApi";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

export function KnowledgeFilterBar({ filters, onChange, showCategory = true, showCompany = false }) {
    const { data: categories } = useGetCategoryTreeQuery(undefined, { skip: !showCategory });
    const { data: companies } = useGetCompaniesQuery(undefined, { skip: !showCompany });

    const set = (key, value) => onChange({ ...filters, [key]: value === "all" ? undefined : value, page: 1 });

    return (
        <div className="mb-6 flex flex-wrap items-center gap-2">
            <Input
                placeholder="Filter by tag..."
                value={filters.tags || ""}
                onChange={(e) => set("tags", e.target.value || undefined)}
                className="h-8 w-40"
            />

            {showCategory && (
                <Select value={filters.category || "all"} onValueChange={(v) => set("category", v)}>
                    <SelectTrigger size="sm" className="w-40">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categories?.map((c) => (
                            <SelectItem key={c._id} value={c._id}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <Select value={filters.difficulty || "all"} onValueChange={(v) => set("difficulty", v)}>
                <SelectTrigger size="sm" className="w-36">
                    <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All difficulties</SelectItem>
                    {DIFFICULTIES.map((d) => (
                        <SelectItem key={d} value={d} className="capitalize">
                            {d}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {showCompany && (
                <Select value={filters.company || "all"} onValueChange={(v) => set("company", v)}>
                    <SelectTrigger size="sm" className="w-40">
                        <SelectValue placeholder="Company" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All companies</SelectItem>
                        {companies?.map((c) => (
                            <SelectItem key={c._id} value={c._id}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <Select value={filters.sort || "-createdAt"} onValueChange={(v) => set("sort", v)}>
                <SelectTrigger size="sm" className="w-40">
                    <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="-createdAt">Newest</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                    <SelectItem value="-viewCount">Most viewed</SelectItem>
                    <SelectItem value="difficulty">Difficulty</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
