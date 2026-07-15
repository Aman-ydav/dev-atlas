import { useState } from "react";
import { toast } from "sonner";
import { TrashIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    useCreateCategoryMutation,
    useDeleteCategoryMutation,
    useGetCategoryTreeQuery,
} from "@/store/api/categoryApi";

const flatten = (nodes, depth = 0) =>
    nodes.flatMap((node) => [{ ...node, depth }, ...flatten(node.children || [], depth + 1)]);

export default function AdminCategoriesPage() {
    const { data: tree } = useGetCategoryTreeQuery();
    const [createCategory, { isLoading }] = useCreateCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();
    const [form, setForm] = useState({ name: "", parent: "", icon: "shapes", description: "" });

    const flat = flatten(tree || []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createCategory({ ...form, parent: form.parent || null }).unwrap();
            toast.success("Category created");
            setForm({ name: "", parent: "", icon: "shapes", description: "" });
        } catch (error) {
            toast.error(error.message || "Failed to create category");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteCategory(id).unwrap();
            toast.success("Category deleted");
        } catch (error) {
            toast.error(error.message || "Failed to delete — it may still have cards or subcategories");
        }
    };

    return (
        <div className="max-w-xl">
            <PageHeader title="Categories" description="The Explore taxonomy. Lucide icon names (kebab-case) render automatically." />

            <form onSubmit={handleCreate} className="mb-8 space-y-3 rounded-lg border border-border p-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label>Name</Label>
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Parent (optional)</Label>
                        <Select value={form.parent || "none"} onValueChange={(v) => setForm({ ...form, parent: v === "none" ? "" : v })}>
                            <SelectTrigger><SelectValue placeholder="Top-level" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Top-level</SelectItem>
                                {flat.map((c) => (
                                    <SelectItem key={c._id} value={c._id}>{"—".repeat(c.depth)} {c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label>Icon (lucide kebab-case name)</Label>
                    <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="binary" />
                </div>
                <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <Button type="submit" disabled={isLoading}>Add category</Button>
            </form>

            <div className="space-y-1">
                {flat.map((c) => (
                    <div key={c._id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                        <span style={{ paddingLeft: c.depth * 16 }}>{c.name}</span>
                        <button onClick={() => handleDelete(c._id)} aria-label="Delete">
                            <TrashIcon className="size-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
