import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { flattenCategories } from "@/lib/flattenCategories";
import { DIFFICULTY_LABEL } from "@/components/knowledge/DifficultyBadge";
import { useGetCategoryTreeQuery } from "@/store/api/categoryApi";
import { useGetCompaniesQuery } from "@/store/api/companyApi";

// Same Base-UI-needs-`items`-for-a-label quirk as RevisionControls' status
// select — without `items` the trigger showed the raw value ("all",
// "-createdAt") instead of the SelectItem label.
const DIFFICULTY_ITEMS = { all: "All difficulties", ...DIFFICULTY_LABEL };
const SORT_ITEMS = {
    "-createdAt": "Newest",
    title: "Title A-Z",
    "-viewCount": "Most viewed",
    difficulty: "Difficulty",
};

export function KnowledgeFilterBar({ filters, onChange, showCategory = true, showCompany = false }) {
    const { data: categoryTree } = useGetCategoryTreeQuery(undefined, { skip: !showCategory });
    const { data: companies } = useGetCompaniesQuery(undefined, { skip: !showCompany });
    const categories = flattenCategories(categoryTree);

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
                        <SelectValue placeholder="Category">
                            {(value) => (value === "all" || !value ? "Category" : categories.find((c) => c._id === value)?.name || value)}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" label="All categories">All categories</SelectItem>
                        {categories.map((c) => (
                            <SelectItem key={c._id} value={c._id} label={c.name}>
                                {"—".repeat(c.depth)} {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <Select items={DIFFICULTY_ITEMS} value={filters.difficulty || "all"} onValueChange={(v) => set("difficulty", v)}>
                <SelectTrigger size="sm" className="w-36">
                    <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(DIFFICULTY_ITEMS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {showCompany && (
                <Select value={filters.company || "all"} onValueChange={(v) => set("company", v)}>
                    <SelectTrigger size="sm" className="w-40">
                        <SelectValue placeholder="Company">
                            {(value) => (value === "all" || !value ? "Company" : companies?.find((c) => c._id === value)?.name || value)}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" label="All companies">All companies</SelectItem>
                        {companies?.map((c) => (
                            <SelectItem key={c._id} value={c._id} label={c.name}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <Select items={SORT_ITEMS} value={filters.sort || "-createdAt"} onValueChange={(v) => set("sort", v)}>
                <SelectTrigger size="sm" className="w-40">
                    <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(SORT_ITEMS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
