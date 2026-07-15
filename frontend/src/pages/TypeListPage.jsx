import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KnowledgeFilterBar } from "@/components/knowledge/KnowledgeFilterBar";
import { KnowledgeGrid } from "@/components/knowledge/KnowledgeGrid";

// One engine, one list view — Practice/Interview/Projects are all just this
// component pinned to a different `type` filter on the same Knowledge collection.
export function TypeListPage({ type, title, description, showCompany = false }) {
    const [filters, setFilters] = useState({ page: 1, limit: 12 });

    return (
        <div>
            <PageHeader title={title} description={description} />
            <KnowledgeFilterBar filters={filters} onChange={setFilters} showCompany={showCompany} />
            <KnowledgeGrid
                params={{ ...filters, type }}
                onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            />
        </div>
    );
}
