import { BookOpenIcon, FileIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ResourceCard, RESOURCE_KIND_META } from "@/components/shared/ResourceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useGetResourcesQuery } from "@/store/api/resourceApi";

export default function ResourcesPage() {
    const { data: resources, isLoading } = useGetResourcesQuery(undefined);

    const grouped = (resources || []).reduce((acc, resource) => {
        (acc[resource.kind] ||= []).push(resource);
        return acc;
    }, {});

    return (
        <div>
            <PageHeader title="Resources" description="Curated external references, one place instead of scattered bookmarks." />

            {isLoading && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-xl" />
                    ))}
                </div>
            )}

            {!isLoading && (resources?.length ?? 0) === 0 && (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <BookOpenIcon />
                        </EmptyMedia>
                        <EmptyTitle>No resources yet</EmptyTitle>
                        <EmptyDescription>Resources added by admins to knowledge cards will show up here.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}

            <div className="space-y-8">
                {Object.entries(grouped).map(([kind, items]) => {
                    const meta = RESOURCE_KIND_META[kind] || { label: kind, icon: FileIcon };
                    const Icon = meta.icon;
                    return (
                        <section key={kind}>
                            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Icon className="size-4 text-muted-foreground" />
                                {meta.label}
                            </h2>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {items.map((resource) => (
                                    <ResourceCard key={resource._id} resource={resource} />
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
