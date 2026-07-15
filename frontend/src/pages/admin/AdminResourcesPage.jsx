import { useState } from "react";
import { toast } from "sonner";
import { ExternalLinkIcon, TrashIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateResourceMutation, useDeleteResourceMutation, useGetResourcesQuery } from "@/store/api/resourceApi";

const RESOURCE_KINDS = [
    "official_docs", "article", "blog", "github", "book",
    "video", "pdf", "research_paper", "cheatsheet",
];

const emptyForm = () => ({ title: "", url: "", kind: "article", description: "" });

export default function AdminResourcesPage() {
    const { data: resources } = useGetResourcesQuery(undefined);
    const [createResource, { isLoading }] = useCreateResourceMutation();
    const [deleteResource] = useDeleteResourceMutation();
    const [form, setForm] = useState(emptyForm());

    const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createResource(form).unwrap();
            toast.success("Resource added");
            setForm(emptyForm());
        } catch (error) {
            toast.error(error.message || "Failed to add resource");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteResource(id).unwrap();
            toast.success("Resource removed");
        } catch (error) {
            toast.error(error.message || "Failed to remove resource");
        }
    };

    return (
        <div className="max-w-2xl">
            <PageHeader
                title="Resources"
                description="External links (docs, articles, videos...) shown on the public Resources page and attachable to any card."
            />

            <form onSubmit={handleCreate} className="mb-8 space-y-3 rounded-lg border border-border p-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label>Title</Label>
                        <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Kind</Label>
                        <Select value={form.kind} onValueChange={(v) => set("kind", v)}>
                            <SelectTrigger>
                                <SelectValue>{(value) => (value ? value.replace(/_/g, " ") : "Select...")}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {RESOURCE_KINDS.map((k) => (
                                    <SelectItem key={k} value={k} label={k} className="capitalize">
                                        {k.replace(/_/g, " ")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label>URL</Label>
                    <Input type="url" value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://..." required />
                </div>
                <div className="space-y-1.5">
                    <Label>Description (optional)</Label>
                    <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="min-h-16" />
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>Add resource</Button>
                </div>
            </form>

            <div className="space-y-1">
                {resources?.map((r) => (
                    <div key={r._id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="truncate font-medium">{r.title}</span>
                                <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[0.65rem] capitalize text-muted-foreground">
                                    {r.kind.replace(/_/g, " ")}
                                </span>
                            </div>
                            <a
                                href={r.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-foreground"
                            >
                                {r.url} <ExternalLinkIcon className="size-3 shrink-0" />
                            </a>
                        </div>
                        <button type="button" onClick={() => handleDelete(r._id)} aria-label="Delete" className="shrink-0">
                            <TrashIcon className="size-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                    </div>
                ))}
                {resources?.length === 0 && <p className="text-xs text-muted-foreground">No resources yet.</p>}
            </div>
        </div>
    );
}
