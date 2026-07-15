import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ClockIcon, ExternalLinkIcon, PencilIcon, UploadCloudIcon } from "lucide-react";
import { PageLoader } from "@/components/shared/PageLoader";
import { TypeBadge } from "@/components/knowledge/TypeBadge";
import { DifficultyBadge } from "@/components/knowledge/DifficultyBadge";
import { RevisionControls } from "@/components/knowledge/RevisionControls";
import { HighlightableContent } from "@/components/knowledge/HighlightableContent";
import { VisualizationBlock } from "@/components/knowledge/VisualizationBlock";
import { CodeExamplesList } from "@/components/knowledge/CodeExamplesList";
import { InterviewQuestionsList } from "@/components/knowledge/InterviewQuestionsList";
import { RelatedTopics } from "@/components/knowledge/RelatedTopics";
import { PersonalNotes } from "@/components/knowledge/PersonalNotes";
import { MarkdownRenderer } from "@/components/knowledge/MarkdownRenderer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { selectIsAdmin } from "@/store/slices/authSlice";
import { useGetKnowledgeBySlugQuery, usePublishKnowledgeMutation } from "@/store/api/knowledgeApi";

const Section = ({ title, children }) =>
    children ? (
        <section className="border-t border-border pt-6">
            <h2 className="mb-3 text-base font-semibold text-foreground">{title}</h2>
            {children}
        </section>
    ) : null;

export default function KnowledgeDetailPage() {
    const { slug } = useParams();
    const { data: knowledge, isLoading } = useGetKnowledgeBySlugQuery(slug);
    const isAdmin = useSelector(selectIsAdmin);
    const [publishKnowledge, { isLoading: isPublishing }] = usePublishKnowledgeMutation();
    const [solutionRevealed, setSolutionRevealed] = useState(false);

    if (isLoading) return <PageLoader />;
    if (!knowledge) return null;

    const { content } = knowledge;
    const isDsaGated = knowledge.type === "dsa" && content.codeExamples?.length > 0;

    return (
        <article className="space-y-6">
            <header>
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <TypeBadge type={knowledge.type} />
                    <DifficultyBadge difficulty={knowledge.difficulty} />
                    {knowledge.category?.name && <Badge variant="ghost">{knowledge.category.name}</Badge>}
                    {knowledge.status !== "published" && <Badge variant="destructive">{knowledge.status}</Badge>}
                </div>

                <div className="flex flex-wrap items-start justify-between gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">{knowledge.title}</h1>
                    {isAdmin && (
                        <div className="flex gap-2">
                            {knowledge.status === "draft" && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={isPublishing}
                                    onClick={() => publishKnowledge(knowledge._id)}
                                >
                                    <UploadCloudIcon /> Publish
                                </Button>
                            )}
                            <Button size="sm" variant="outline" nativeButton={false} render={<Link to={`/admin/knowledge/${knowledge.slug}/edit`} />}>
                                <PencilIcon /> Edit
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <ClockIcon className="size-3" /> {knowledge.readTimeMinutes} min read
                    </span>
                    <span>Updated {new Date(knowledge.updatedAt).toLocaleDateString()}</span>
                    {knowledge.tags?.map((tag) => (
                        <span key={tag}>#{tag}</span>
                    ))}
                </div>
            </header>

            <RevisionControls knowledgeId={knowledge._id} />

            {content.tldr && (
                <section>
                    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">TL;DR</h2>
                    <HighlightableContent knowledgeId={knowledge._id} block="tldr" content={content.tldr} />
                </section>
            )}

            <Section title="Explanation">
                <HighlightableContent knowledgeId={knowledge._id} block="explanation" content={content.explanation} />
            </Section>

            {content.visualization?.kind !== "none" && (
                <Section title="Visualization">
                    <VisualizationBlock visualization={content.visualization} />
                </Section>
            )}

            {knowledge.type === "dsa" && <DsaSection knowledge={knowledge} />}
            {knowledge.type === "project" && <ProjectSection knowledge={knowledge} />}
            {knowledge.type === "interview" && knowledge.role && (
                <Section title="Role">
                    <Badge variant="secondary" className="capitalize">
                        {knowledge.role.replace("-", " ")}
                    </Badge>
                </Section>
            )}

            {content.codeExamples?.length > 0 && (
                <Section title="Code Examples">
                    {isDsaGated && !solutionRevealed ? (
                        <Button variant="outline" onClick={() => setSolutionRevealed(true)}>
                            Show solution
                        </Button>
                    ) : (
                        <CodeExamplesList examples={content.codeExamples} />
                    )}
                </Section>
            )}

            <Section title="Interview Questions">
                <InterviewQuestionsList questions={content.interviewQuestions} />
            </Section>

            {content.mistakes?.length > 0 && (
                <Section title="Common Mistakes">
                    <Accordion type="single" className="w-full">
                        {content.mistakes.map((mistake, i) => (
                            <AccordionItem key={i} value={`mistake-${i}`}>
                                <AccordionTrigger className="text-left text-sm font-medium">
                                    {mistake.title}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <MarkdownRenderer content={mistake.explanation} />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </Section>
            )}

            {knowledge.resources?.length > 0 && (
                <Section title="Resources">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {knowledge.resources.map((resource) => (
                            <a
                                key={resource._id}
                                href={resource.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-foreground/30"
                            >
                                {resource.title}
                                <ExternalLinkIcon className="size-3.5 shrink-0 text-muted-foreground" />
                            </a>
                        ))}
                    </div>
                </Section>
            )}

            <Section title="Related Topics">
                <RelatedTopics slug={knowledge.slug} />
            </Section>

            <div className="border-t border-border pt-6">
                <PersonalNotes knowledgeId={knowledge._id} />
            </div>
        </article>
    );
}

function DsaSection({ knowledge }) {
    return (
        <Section title="Approach">
            <div className="mb-3 flex flex-wrap gap-1.5 text-xs">
                {knowledge.pattern && <Badge variant="secondary">{knowledge.pattern}</Badge>}
                {knowledge.complexity?.time && <Badge variant="outline">Time {knowledge.complexity.time}</Badge>}
                {knowledge.complexity?.space && <Badge variant="outline">Space {knowledge.complexity.space}</Badge>}
                {knowledge.externalUrl && (
                    <a href={knowledge.externalUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                        View original problem
                    </a>
                )}
            </div>
            <MarkdownRenderer content={knowledge.approach} />
            {knowledge.hints?.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {knowledge.hints.map((hint, i) => (
                        <li key={i}>{hint}</li>
                    ))}
                </ul>
            )}
        </Section>
    );
}

function ProjectSection({ knowledge }) {
    const blocks = [
        ["Architecture", knowledge.architectureNotes],
        ["Database", knowledge.databaseNotes],
        ["API", knowledge.apiNotes],
        ["Deployment", knowledge.deploymentNotes],
    ].filter(([, value]) => value);

    return (
        <>
            <Section title="Overview">
                {knowledge.tagline && <p className="mb-2 text-sm text-muted-foreground">{knowledge.tagline}</p>}
                <div className="flex flex-wrap gap-1.5">
                    {knowledge.techStack?.map((tech) => (
                        <Badge key={tech} variant="secondary">
                            {tech}
                        </Badge>
                    ))}
                </div>
                <div className="mt-2 flex gap-3 text-sm">
                    {knowledge.repoUrl && (
                        <a href={knowledge.repoUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                            Repository
                        </a>
                    )}
                    {knowledge.demoUrl && (
                        <a href={knowledge.demoUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                            Live demo
                        </a>
                    )}
                </div>
            </Section>

            {blocks.map(([title, value]) => (
                <Section key={title} title={title}>
                    <MarkdownRenderer content={value} />
                </Section>
            ))}

            {knowledge.challenges?.length > 0 && (
                <Section title="Challenges">
                    <div className="space-y-3">
                        {knowledge.challenges.map((c, i) => (
                            <div key={i} className="rounded-lg border border-border p-3">
                                <p className="mb-1 text-sm font-medium">{c.title}</p>
                                <MarkdownRenderer content={c.description} />
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {knowledge.decisions?.length > 0 && (
                <Section title="Decisions">
                    <div className="space-y-3">
                        {knowledge.decisions.map((d, i) => (
                            <div key={i} className="rounded-lg border border-border p-3">
                                <p className="mb-1 text-sm font-medium">{d.title}</p>
                                <p className="mb-1 text-sm text-foreground/90">{d.rationale}</p>
                                {d.alternativesConsidered && (
                                    <p className="text-xs text-muted-foreground">
                                        Alternatives considered: {d.alternativesConsidered}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {(knowledge.lessonsLearned?.length > 0 || knowledge.improvements?.length > 0) && (
                <Section title="Lessons Learned">
                    <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/90">
                        {knowledge.lessonsLearned?.map((l, i) => (
                            <li key={`l-${i}`}>{l}</li>
                        ))}
                    </ul>
                    {knowledge.improvements?.length > 0 && (
                        <>
                            <p className="mb-1 mt-3 text-xs font-medium text-muted-foreground">
                                What I'd do differently
                            </p>
                            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/90">
                                {knowledge.improvements.map((imp, i) => (
                                    <li key={`i-${i}`}>{imp}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </Section>
            )}
        </>
    );
}
