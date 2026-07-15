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
    UploadIcon,
} from "lucide-react";
import { GithubIcon } from "@/components/shared/GithubIcon";
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item";

// Single source of truth for resource-kind label + icon — previously
// duplicated between ResourcesPage.jsx and (implicitly) nowhere else, since
// KnowledgeDetailPage's resources block didn't surface kind at all.
export const RESOURCE_KIND_META = {
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

export function ResourceCard({ resource }) {
    const meta = RESOURCE_KIND_META[resource.kind] || { label: resource.kind, icon: FileIcon };
    const Icon = meta.icon;

    return (
        <Item variant="outline" render={<a href={resource.url} target="_blank" rel="noreferrer" />}>
            <ItemMedia variant="icon">
                <Icon />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>
                    {resource.title}
                    {resource.sourceType === "upload" && (
                        <UploadIcon aria-label="Uploaded file" className="size-3 text-muted-foreground" />
                    )}
                </ItemTitle>
                {resource.description && <ItemDescription>{resource.description}</ItemDescription>}
            </ItemContent>
            <ItemActions>
                <ExternalLinkIcon className="size-3.5 text-muted-foreground" />
            </ItemActions>
        </Item>
    );
}
