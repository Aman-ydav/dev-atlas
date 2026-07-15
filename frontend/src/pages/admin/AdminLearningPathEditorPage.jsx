import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageLoader } from "@/components/shared/PageLoader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LearningPathStepsEditor } from "@/components/admin/LearningPathStepsEditor";
import { flattenCategories } from "@/lib/flattenCategories";
import { useGetCategoryTreeQuery } from "@/store/api/categoryApi";
import {
    useCreateLearningPathMutation,
    useGetLearningPathBySlugQuery,
    useUpdateLearningPathMutation,
} from "@/store/api/learningPathApi";

const emptyForm = () => ({
    title: "",
    description: "",
    category: "",
    published: false,
    steps: [],
});

export default function AdminLearningPathEditorPage() {
    const { slug } = useParams();
    const isEdit = Boolean(slug);
    const navigate = useNavigate();

    const { data: existing, isLoading: loadingExisting } = useGetLearningPathBySlugQuery(slug, { skip: !isEdit });
    const { data: categories } = useGetCategoryTreeQuery();
    const flatCategories = flattenCategories(categories);
    const [createLearningPath, { isLoading: creating }] = useCreateLearningPathMutation();
    const [updateLearningPath, { isLoading: updating }] = useUpdateLearningPathMutation();

    const [form, setForm] = useState(emptyForm());

    useEffect(() => {
        if (!existing) return;
        setForm({
            title: existing.title,
            description: existing.description || "",
            category: existing.category?._id || "",
            published: existing.published,
            steps: (existing.steps || []).map((s) => ({
                knowledge: s.knowledge?._id || "",
                knowledgeTitle: s.knowledge?.title || "",
                optional: s.optional,
            })),
        });
    }, [existing]);

    const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.steps.some((s) => !s.knowledge)) {
            toast.error("Every step needs a card selected");
            return;
        }

        const payload = {
            title: form.title,
            description: form.description,
            category: form.category || undefined,
            published: form.published,
            steps: form.steps.map((s) => ({ knowledge: s.knowledge, optional: s.optional })),
        };

        try {
            if (isEdit) {
                await updateLearningPath({ id: existing._id, ...payload }).unwrap();
                toast.success("Learning path updated");
            } else {
                await createLearningPath(payload).unwrap();
                toast.success("Learning path created");
            }
            navigate("/admin/learning-paths");
        } catch (error) {
            toast.error(error.message || "Failed to save learning path");
        }
    };

    if (isEdit && loadingExisting) return <PageLoader />;

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 pb-16">
            <PageHeader title={isEdit ? `Edit: ${form.title}` : "New Learning Path"} />

            <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </div>

            <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="min-h-20" />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label>Category (optional)</Label>
                    <Select value={form.category || "none"} onValueChange={(v) => set("category", v === "none" ? "" : v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="None">
                                {(value) =>
                                    value === "none" || !value ? "None" : flatCategories.find((c) => c._id === value)?.name || value
                                }
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none" label="None">None</SelectItem>
                            {flatCategories.map((c) => (
                                <SelectItem key={c._id} value={c._id} label={c.name}>
                                    {"—".repeat(c.depth)} {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={form.published} onCheckedChange={(checked) => set("published", !!checked)} />
                        Published
                    </label>
                </div>
            </div>

            <Separator />

            <LearningPathStepsEditor steps={form.steps} onChange={(steps) => set("steps", steps)} />

            <div className="flex justify-end gap-2">
                <Button type="submit" disabled={creating || updating}>
                    {isEdit ? "Save changes" : "Create learning path"}
                </Button>
            </div>
        </form>
    );
}
