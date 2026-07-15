import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MarkdownRenderer } from "@/components/knowledge/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";

export function InterviewQuestionsList({ questions }) {
    if (!questions?.length) return null;

    // base-ui's Accordion has no `collapsible` prop (unlike Radix) — type="single" is already toggleable
    return (
        <Accordion type="single" className="w-full">
            {questions.map((q, index) => (
                <AccordionItem key={index} value={`q-${index}`}>
                    <AccordionTrigger className="text-left text-sm font-medium">{q.question}</AccordionTrigger>
                    <AccordionContent>
                        <MarkdownRenderer content={q.idealAnswer} />

                        {q.followUps?.length > 0 && (
                            <div className="mt-3">
                                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Follow-ups</p>
                                <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/90">
                                    {q.followUps.map((f, i) => (
                                        <li key={i}>{f}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {q.commonMistakes?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {q.commonMistakes.map((m, i) => (
                                    <Badge key={i} variant="destructive">
                                        {m}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
