import {
    BookOpenIcon,
    FileTextIcon,
    NewspaperIcon,
    BookIcon,
    VideoIcon,
    FileIcon,
    GraduationCapIcon,
    ClipboardListIcon,
    ExternalLinkIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GithubIcon } from "@/components/shared/GithubIcon";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useGetResourcesQuery } from "@/store/api/resourceApi";

const KIND_META = {
    official_docs: { label: "Official Docs", icon: BookOpenIcon },
    article: { label: "Articles", icon: FileTextIcon },
    blog: { label: "Blogs", icon: NewspaperIcon },
    github: { label: "GitHub", icon: GithubIcon },
    book: { label: "Books", icon: BookIcon },
    video: { label: "Videos", icon: VideoIcon },
    pdf: { label: "PDFs", icon: FileIcon },
    research_paper: { label: "Research Papers", icon: GraduationCapIcon },
    cheatsheet: { label: "Cheat Sheets", icon: ClipboardListIcon },
};

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
                    const meta = KIND_META[kind] || { label: kind, icon: FileIcon };
                    const Icon = meta.icon;
                    return (
                        <section key={kind}>
                            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Icon className="size-4 text-muted-foreground" />
                                {meta.label}
                            </h2>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {items.map((resource) => (
                                    <a
                                        key={resource._id}
                                        href={resource.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group/card block"
                                    >
                                        <Card className="gap-1 py-3 transition-colors group-hover/card:border-foreground/20">
                                            <CardContent className="flex items-start justify-between gap-2 px-4">
                                                <div>
                                                    <p className="text-sm font-medium">{resource.title}</p>
                                                    {resource.description && (
                                                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                                            {resource.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <ExternalLinkIcon className="size-3.5 shrink-0 text-muted-foreground" />
                                            </CardContent>
                                        </Card>
                                    </a>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
