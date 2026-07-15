import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { InfoIcon, PlusIcon, TrashIcon, UploadIcon, XIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageLoader } from "@/components/shared/PageLoader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RepeatableRows } from "@/components/admin/RepeatableRows";
import { LineListEditor } from "@/components/admin/LineListEditor";
import { KnowledgeCombobox } from "@/components/admin/KnowledgeCombobox";
import { MarkdownField } from "@/components/admin/MarkdownField";
import { flattenCategories } from "@/lib/flattenCategories";
import { useGetCategoryTreeQuery } from "@/store/api/categoryApi";
import { useGetCompaniesQuery } from "@/store/api/companyApi";
import { useUploadFileMutation } from "@/store/api/uploadApi";
import {
    useCreateKnowledgeMutation,
    useGetKnowledgeBySlugQuery,
    useUpdateKnowledgeMutation,
} from "@/store/api/knowledgeApi";

const RELATION_TYPES = [
    "related_to", "depends_on", "used_in", "implements", "alternative",
    "prerequisite", "example_of", "part_of", "referenced_by",
];
const INTERVIEW_ROLES = [
    "hr", "frontend", "backend", "javascript", "react", "database",
    "dbms", "sql", "os", "cn", "system-design", "project-discussion",
];

const emptyForm = () => ({
    title: "",
    type: "concept",
    category: "",
    tags: "",
    difficulty: "intermediate",
    status: "draft",
    readTimeMinutes: 5,
    content: {
        tldr: "",
        explanation: "",
        visualization: { kind: "none", mermaidSource: "", flowJson: "" },
        codeExamples: [],
        mistakes: [],
        interviewQuestions: [],
    },
    relations: [],
    companyIds: [],
    pattern: "",
    complexity: { time: "", space: "" },
    constraints: "",
    externalUrl: "",
    approach: "",
    hints: [],
    role: "frontend",
    realProjectExampleSlug: "",
    realProjectExampleTitle: "",
    tagline: "",
    techStack: [],
    repoUrl: "",
    demoUrl: "",
    architectureNotes: "",
    databaseNotes: "",
    apiNotes: "",
    deploymentNotes: "",
    challenges: [],
    decisions: [],
    lessonsLearned: [],
    improvements: [],
    gallery: [],
});

const resolveSlugToId = async (slug) => {
    if (!slug?.trim()) return null;
    const res = await fetch(`/api/v1/knowledge/${slug.trim()}`, { credentials: "include" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?._id || null;
};

export default function AdminEditorPage() {
    const { slug } = useParams();
    const isEdit = Boolean(slug);
    const navigate = useNavigate();

    const { data: existing, isLoading: loadingExisting } = useGetKnowledgeBySlugQuery(slug, { skip: !isEdit });
    const { data: categories } = useGetCategoryTreeQuery();
    const flatCategories = flattenCategories(categories);
    const { data: companies } = useGetCompaniesQuery(undefined);
    const [createKnowledge, { isLoading: creating }] = useCreateKnowledgeMutation();
    const [updateKnowledge, { isLoading: updating }] = useUpdateKnowledgeMutation();
    const [uploadFile, { isLoading: uploading }] = useUploadFileMutation();

    const [form, setForm] = useState(emptyForm());

    useEffect(() => {
        if (!existing) return;
        setForm({
            ...emptyForm(),
            ...existing,
            tags: (existing.tags || []).join(", "),
            category: existing.category?._id || existing.category || "",
            content: {
                tldr: existing.content?.tldr || "",
                explanation: existing.content?.explanation || "",
                visualization: {
                    kind: existing.content?.visualization?.kind || "none",
                    mermaidSource: existing.content?.visualization?.mermaidSource || "",
                    flowJson: existing.content?.visualization?.flow
                        ? JSON.stringify(existing.content.visualization.flow, null, 2)
                        : "",
                },
                codeExamples: existing.content?.codeExamples || [],
                mistakes: existing.content?.mistakes || [],
                interviewQuestions: (existing.content?.interviewQuestions || []).map((q) => ({
                    ...q,
                    followUps: (q.followUps || []).join("\n"),
                    commonMistakes: (q.commonMistakes || []).join("\n"),
                })),
            },
            companyIds: (existing.companies || []).map((c) => c._id || c),
            relations: (existing.relations || []).map((r) => ({
                knowledgeSlug: r.knowledge?.slug || "",
                knowledgeTitle: r.knowledge?.title || "",
                relationType: r.relationType,
            })),
            hints: existing.hints || [],
            techStack: existing.techStack || [],
            lessonsLearned: existing.lessonsLearned || [],
            improvements: existing.improvements || [],
            gallery: existing.gallery || [],
            realProjectExampleSlug: existing.realProjectExampleRef?.slug || "",
            realProjectExampleTitle: existing.realProjectExampleRef?.title || "",
        });
    }, [existing]);

    const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
    const setContent = (key, value) => setForm((f) => ({ ...f, content: { ...f.content, [key]: value } }));
    const setVisualization = (key, value) =>
        setForm((f) => ({ ...f, content: { ...f.content, visualization: { ...f.content.visualization, [key]: value } } }));

    const toggleCompany = (id) =>
        setForm((f) => ({
            ...f,
            companyIds: f.companyIds.includes(id) ? f.companyIds.filter((c) => c !== id) : [...f.companyIds, id],
        }));

    const handleGalleryUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const attachment = await uploadFile(file).unwrap();
            set("gallery", [...form.gallery, attachment]);
        } catch (error) {
            toast.error(error.message || "Upload failed");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let flow = null;
        if (form.content.visualization.kind === "flow" && form.content.visualization.flowJson.trim()) {
            try {
                flow = JSON.parse(form.content.visualization.flowJson);
            } catch {
                toast.error("Flow JSON is not valid — check the syntax");
                return;
            }
        }

        const relations = [];
        for (const rel of form.relations) {
            const id = await resolveSlugToId(rel.knowledgeSlug);
            if (id) relations.push({ knowledge: id, relationType: rel.relationType });
        }

        const realProjectExampleRef = form.type === "interview" ? await resolveSlugToId(form.realProjectExampleSlug) : undefined;

        const payload = {
            title: form.title,
            type: form.type,
            category: form.category,
            tags: form.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
            difficulty: form.difficulty,
            status: form.status,
            readTimeMinutes: Number(form.readTimeMinutes) || 5,
            content: {
                tldr: form.content.tldr,
                explanation: form.content.explanation,
                visualization: {
                    kind: form.content.visualization.kind,
                    mermaidSource: form.content.visualization.mermaidSource,
                    flow,
                },
                codeExamples: form.content.codeExamples,
                mistakes: form.content.mistakes,
                interviewQuestions: form.content.interviewQuestions.map((q) => ({
                    ...q,
                    followUps: (q.followUps || "").split("\n").map((s) => s.trim()).filter(Boolean),
                    commonMistakes: (q.commonMistakes || "").split("\n").map((s) => s.trim()).filter(Boolean),
                })),
            },
            relations,
            companies: form.companyIds,
            ...(form.type === "dsa" && {
                pattern: form.pattern,
                complexity: form.complexity,
                constraints: form.constraints,
                externalUrl: form.externalUrl,
                approach: form.approach,
                hints: form.hints,
            }),
            ...(form.type === "interview" && {
                role: form.role,
                ...(realProjectExampleRef && { realProjectExampleRef }),
            }),
            ...(form.type === "project" && {
                tagline: form.tagline,
                techStack: form.techStack,
                repoUrl: form.repoUrl,
                demoUrl: form.demoUrl,
                architectureNotes: form.architectureNotes,
                databaseNotes: form.databaseNotes,
                apiNotes: form.apiNotes,
                deploymentNotes: form.deploymentNotes,
                challenges: form.challenges,
                decisions: form.decisions,
                lessonsLearned: form.lessonsLearned,
                improvements: form.improvements,
                gallery: form.gallery.map((g) => g._id),
            }),
        };

        try {
            if (isEdit) {
                const result = await updateKnowledge({ id: existing._id, ...payload }).unwrap();
                toast.success("Saved");
                navigate(`/knowledge/${result.slug}`);
            } else {
                const result = await createKnowledge(payload).unwrap();
                toast.success("Created");
                navigate(`/admin/knowledge/${result.slug}/edit`);
            }
        } catch (error) {
            toast.error(error.message || "Failed to save");
        }
    };

    if (isEdit && loadingExisting) return <PageLoader />;

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-8 pb-16">
            <PageHeader title={isEdit ? `Edit: ${form.title}` : "New Knowledge Card"} />

            <section className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label>Title</Label>
                        <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Type</Label>
                        <Select value={form.type} onValueChange={(v) => set("type", v)} disabled={isEdit}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="concept">Concept</SelectItem>
                                <SelectItem value="dsa">DSA</SelectItem>
                                <SelectItem value="interview">Interview</SelectItem>
                                <SelectItem value="project">Project</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                        <Label>Category</Label>
                        <Select value={form.category} onValueChange={(v) => set("category", v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select...">
                                    {(value) => (value ? flatCategories.find((c) => c._id === value)?.name || value : "Select...")}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {flatCategories.map((c) => (
                                    <SelectItem key={c._id} value={c._id} label={c.name}>
                                        {"—".repeat(c.depth)} {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Difficulty</Label>
                        <Select value={form.difficulty} onValueChange={(v) => set("difficulty", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select value={form.status} onValueChange={(v) => set("status", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label>Tags (comma separated)</Label>
                        <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="async, promises" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Read time (minutes)</Label>
                        <Input type="number" min={1} value={form.readTimeMinutes} onChange={(e) => set("readTimeMinutes", e.target.value)} />
                    </div>
                </div>

                {companies?.length > 0 && (
                    <div className="space-y-1.5">
                        <Label>Companies</Label>
                        <div className="flex flex-wrap gap-2">
                            {companies.map((c) => (
                                <button
                                    type="button"
                                    key={c._id}
                                    onClick={() => toggleCompany(c._id)}
                                    className={`rounded-full border px-2.5 py-1 text-xs ${
                                        form.companyIds.includes(c._id)
                                            ? "border-foreground bg-foreground text-background"
                                            : "border-border text-muted-foreground"
                                    }`}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <Separator />

            <section className="space-y-4">
                <MarkdownField
                    label="TL;DR"
                    value={form.content.tldr}
                    onChange={(v) => setContent("tldr", v)}
                    className="min-h-16"
                />
                <MarkdownField
                    label="Explanation"
                    value={form.content.explanation}
                    onChange={(v) => setContent("explanation", v)}
                    className="min-h-40"
                />

                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <Label>Visualization</Label>
                        <Tooltip>
                            <TooltipTrigger render={<InfoIcon className="size-3.5 text-muted-foreground" />} />
                            <TooltipContent className="max-w-64">
                                This is the one headline diagram shown in its own section. For extra diagrams or
                                images at a specific point in the text, use the Image/Diagram buttons inside
                                Explanation (or any other field below) instead — those insert inline, right where
                                the cursor is.
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <Select value={form.content.visualization.kind} onValueChange={(v) => setVisualization("kind", v)}>
                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="mermaid">Mermaid diagram</SelectItem>
                            <SelectItem value="flow">Flow (advanced JSON)</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.content.visualization.kind === "mermaid" && (
                        <Textarea
                            value={form.content.visualization.mermaidSource}
                            onChange={(e) => setVisualization("mermaidSource", e.target.value)}
                            placeholder={"graph TD\n  A[Request] --> B[Upgrade]"}
                            className="mt-2 min-h-24 font-mono text-sm"
                        />
                    )}
                    {form.content.visualization.kind === "flow" && (
                        <div className="mt-2 space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Drag-and-drop diagram authoring is on the roadmap (see docs/18-future-roadmap.md) — for now, paste a React Flow {"{ nodes, edges }"} JSON payload.
                            </p>
                            <Textarea
                                value={form.content.visualization.flowJson}
                                onChange={(e) => setVisualization("flowJson", e.target.value)}
                                className="min-h-24 font-mono text-sm"
                            />
                        </div>
                    )}
                </div>

                <RepeatableRows
                    label="Code Examples"
                    items={form.content.codeExamples}
                    onChange={(v) => setContent("codeExamples", v)}
                    fields={[
                        { key: "label", label: "Label" },
                        { key: "language", label: "Language" },
                        { key: "code", label: "Code", type: "textarea" },
                    ]}
                />

                <RepeatableRows
                    label="Mistakes"
                    items={form.content.mistakes}
                    onChange={(v) => setContent("mistakes", v)}
                    fields={[
                        { key: "title", label: "Title" },
                        { key: "explanation", label: "Explanation", type: "markdown" },
                    ]}
                />

                <RepeatableRows
                    label="Interview Questions"
                    items={form.content.interviewQuestions}
                    onChange={(v) => setContent("interviewQuestions", v)}
                    fields={[
                        { key: "question", label: "Question" },
                        { key: "idealAnswer", label: "Ideal answer", type: "markdown" },
                        { key: "followUps", label: "Follow-ups (one per line)", type: "textarea" },
                        { key: "commonMistakes", label: "Common mistakes (one per line)", type: "textarea" },
                    ]}
                />
            </section>

            <Separator />

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label>Related Topics</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => set("relations", [...form.relations, { knowledgeSlug: "", knowledgeTitle: "", relationType: "related_to" }])}
                    >
                        <PlusIcon /> Add relation
                    </Button>
                </div>
                {form.relations.map((rel, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="flex-1">
                            <KnowledgeCombobox
                                value={rel.knowledgeTitle}
                                excludeSlug={existing?.slug}
                                placeholder="Search cards by title..."
                                onSelect={(item) =>
                                    set("relations", form.relations.map((r, idx) =>
                                        idx === i ? { ...r, knowledgeSlug: item.slug, knowledgeTitle: item.title } : r
                                    ))
                                }
                            />
                        </div>
                        <Select
                            value={rel.relationType}
                            onValueChange={(v) => set("relations", form.relations.map((r, idx) => (idx === i ? { ...r, relationType: v } : r)))}
                        >
                            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {RELATION_TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <button type="button" onClick={() => set("relations", form.relations.filter((_, idx) => idx !== i))}>
                            <TrashIcon className="size-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                    </div>
                ))}
            </section>

            {form.type === "dsa" && (
                <>
                    <Separator />
                    <section className="space-y-4">
                        <h2 className="text-sm font-semibold">DSA details</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Pattern</Label>
                                <Input value={form.pattern} onChange={(e) => set("pattern", e.target.value)} placeholder="Two Pointers" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>External URL</Label>
                                <Input value={form.externalUrl} onChange={(e) => set("externalUrl", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Time complexity</Label>
                                <Input value={form.complexity.time} onChange={(e) => set("complexity", { ...form.complexity, time: e.target.value })} placeholder="O(n)" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Space complexity</Label>
                                <Input value={form.complexity.space} onChange={(e) => set("complexity", { ...form.complexity, space: e.target.value })} placeholder="O(1)" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Constraints</Label>
                            <Textarea value={form.constraints} onChange={(e) => set("constraints", e.target.value)} className="min-h-16" />
                        </div>
                        <MarkdownField
                            label="Approach (strategy-level, not the full solution)"
                            value={form.approach}
                            onChange={(v) => set("approach", v)}
                            className="min-h-24"
                        />
                        <LineListEditor label="Hints (one per line)" value={form.hints} onChange={(v) => set("hints", v)} />
                    </section>
                </>
            )}

            {form.type === "interview" && (
                <>
                    <Separator />
                    <section className="space-y-4">
                        <h2 className="text-sm font-semibold">Interview details</h2>
                        <div className="space-y-1.5">
                            <Label>Role</Label>
                            <Select value={form.role} onValueChange={(v) => set("role", v)}>
                                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {INTERVIEW_ROLES.map((r) => (
                                        <SelectItem key={r} value={r} className="capitalize">{r.replace("-", " ")}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Real project example (optional)</Label>
                            <KnowledgeCombobox
                                value={form.realProjectExampleTitle}
                                placeholder="Search project case studies by title..."
                                onSelect={(item) => {
                                    set("realProjectExampleSlug", item.slug);
                                    set("realProjectExampleTitle", item.title);
                                }}
                            />
                        </div>
                    </section>
                </>
            )}

            {form.type === "project" && (
                <>
                    <Separator />
                    <section className="space-y-4">
                        <h2 className="text-sm font-semibold">Project details</h2>
                        <div className="space-y-1.5">
                            <Label>Tagline</Label>
                            <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
                        </div>
                        <LineListEditor label="Tech stack (one per line)" value={form.techStack} onChange={(v) => set("techStack", v)} />
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Repo URL</Label>
                                <Input value={form.repoUrl} onChange={(e) => set("repoUrl", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Demo URL</Label>
                                <Input value={form.demoUrl} onChange={(e) => set("demoUrl", e.target.value)} />
                            </div>
                        </div>
                        {[
                            ["architectureNotes", "Architecture"],
                            ["databaseNotes", "Database"],
                            ["apiNotes", "API"],
                            ["deploymentNotes", "Deployment"],
                        ].map(([key, label]) => (
                            <MarkdownField key={key} label={label} value={form[key]} onChange={(v) => set(key, v)} className="min-h-20" />
                        ))}

                        <RepeatableRows
                            label="Challenges"
                            items={form.challenges}
                            onChange={(v) => set("challenges", v)}
                            fields={[{ key: "title", label: "Title" }, { key: "description", label: "Description", type: "markdown" }]}
                        />
                        <RepeatableRows
                            label="Decisions"
                            items={form.decisions}
                            onChange={(v) => set("decisions", v)}
                            fields={[
                                { key: "title", label: "Title" },
                                { key: "rationale", label: "Rationale", type: "textarea" },
                                { key: "alternativesConsidered", label: "Alternatives considered", type: "textarea" },
                            ]}
                        />
                        <LineListEditor label="Lessons learned (one per line)" value={form.lessonsLearned} onChange={(v) => set("lessonsLearned", v)} />
                        <LineListEditor label="What I'd do differently (one per line)" value={form.improvements} onChange={(v) => set("improvements", v)} />

                        <div className="space-y-1.5">
                            <Label>Gallery</Label>
                            <div className="flex flex-wrap gap-2">
                                {form.gallery.map((g) => (
                                    <div key={g._id} className="relative">
                                        <img src={g.url} alt="" className="size-16 rounded-md border border-border object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => set("gallery", form.gallery.filter((x) => x._id !== g._id))}
                                            className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-foreground text-background"
                                        >
                                            <XIcon className="size-2.5" />
                                        </button>
                                    </div>
                                ))}
                                <label className="flex size-16 cursor-pointer items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
                                    <UploadIcon className="size-4" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} disabled={uploading} />
                                </label>
                            </div>
                        </div>
                    </section>
                </>
            )}

            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-background py-4">
                <Button type="submit" disabled={creating || updating}>
                    {isEdit ? "Save changes" : "Create card"}
                </Button>
            </div>
        </form>
    );
}
