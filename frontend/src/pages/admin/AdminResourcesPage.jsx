import { useState } from "react";
import { toast } from "sonner";
import { ExternalLinkIcon, TrashIcon, UploadIcon, XIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Attachment, AttachmentContent, AttachmentMedia, AttachmentTitle, AttachmentDescription } from "@/components/ui/attachment";
import { useCreateResourceMutation, useDeleteResourceMutation, useGetResourcesQuery } from "@/store/api/resourceApi";
import { useUploadFileMutation } from "@/store/api/uploadApi";

const RESOURCE_KINDS = [
    "official_docs", "article", "blog", "github", "book",
    "video", "pdf", "research_paper", "cheatsheet",
];

const emptyForm = () => ({ title: "", url: "", kind: "article", description: "", sourceType: "link", attachment: null });

export default function AdminResourcesPage() {
    const { data: resources } = useGetResourcesQuery(undefined);
    const [createResource, { isLoading }] = useCreateResourceMutation();
    const [deleteResource] = useDeleteResourceMutation();
    const [uploadFile, { isLoading: uploading }] = useUploadFileMutation();
    const [form, setForm] = useState(emptyForm());

    const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const attachment = await uploadFile(file).unwrap();
            set("attachment", attachment);
        } catch (error) {
            toast.error(error.message || "Upload failed");
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (form.sourceType === "link" && !form.url.trim()) {
            toast.error("Enter a URL");
            return;
        }
        if (form.sourceType === "upload" && !form.attachment) {
            toast.error("Upload a file first");
            return;
        }
        try {
            await createResource({
                title: form.title,
                kind: form.kind,
                description: form.description,
                sourceType: form.sourceType,
                url: form.sourceType === "upload" ? form.attachment.url : form.url,
                attachment: form.sourceType === "upload" ? form.attachment._id : undefined,
            }).unwrap();
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
                description="Links or uploaded files (docs, articles, videos...) shown on the public Resources page and attachable to any card."
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
                    <Label>Source</Label>
                    <Tabs
                        value={form.sourceType}
                        onValueChange={(v) => setForm((f) => ({ ...f, sourceType: v, url: "", attachment: null }))}
                    >
                        <TabsList variant="line">
                            <TabsTrigger value="link">Link</TabsTrigger>
                            <TabsTrigger value="upload">Upload file</TabsTrigger>
                        </TabsList>
                        <TabsContent value="link" className="pt-3">
                            <Input
                                type="url"
                                value={form.url}
                                onChange={(e) => set("url", e.target.value)}
                                placeholder="https://..."
                            />
                        </TabsContent>
                        <TabsContent value="upload" className="pt-3">
                            {form.attachment ? (
                                <Attachment>
                                    <AttachmentMedia />
                                    <AttachmentContent>
                                        <AttachmentTitle>{form.attachment.format || "file"}</AttachmentTitle>
                                        <AttachmentDescription>{Math.round((form.attachment.bytes || 0) / 1024)} KB</AttachmentDescription>
                                    </AttachmentContent>
                                    <button
                                        type="button"
                                        aria-label="Remove file"
                                        onClick={() => set("attachment", null)}
                                        className="shrink-0 text-muted-foreground hover:text-destructive"
                                    >
                                        <XIcon className="size-3.5" />
                                    </button>
                                </Attachment>
                            ) : (
                                <label className="flex h-16 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-foreground/30">
                                    <UploadIcon className="size-4" />
                                    {uploading ? "Uploading..." : "Choose a file"}
                                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                </label>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-1.5">
                    <Label>Description (optional)</Label>
                    <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="min-h-16" />
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading || uploading}>Add resource</Button>
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
                                {r.sourceType === "upload" && (
                                    <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
                                        Uploaded
                                    </span>
                                )}
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
