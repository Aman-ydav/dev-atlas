import { Link } from "react-router-dom";
import { KnowledgeCard } from "@/components/knowledge/KnowledgeCard";

// One umbrella case study + its linked parts (via the existing `part_of`
// relation) — e.g. an "Everywhere Platform" umbrella with "Auth System" and
// "Notification System" as members. See backend/src/controllers/
// caseStudy.controller.js's getCaseStudyHub for how groups are computed.
export function CaseStudyHubGroup({ group }) {
    const { umbrella, members } = group;
    if (!umbrella) return null;

    return (
        <section>
            <Link to={`/knowledge/${umbrella.slug}`} className="mb-3 flex items-baseline gap-2 hover:underline">
                <h2 className="text-base font-semibold text-foreground">{umbrella.title}</h2>
                <span className="text-xs text-muted-foreground">
                    {members.length} {members.length === 1 ? "part" : "parts"}
                </span>
            </Link>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => (
                    <KnowledgeCard key={member._id} knowledge={member} />
                ))}
            </div>
        </section>
    );
}
