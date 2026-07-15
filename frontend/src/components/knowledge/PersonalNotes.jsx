import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Textarea } from "@/components/ui/textarea";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { useGetProgressQuery, useUpdateProgressMutation } from "@/store/api/progressApi";

const SAVE_DELAY_MS = 800;

export function PersonalNotes({ knowledgeId }) {
    const user = useSelector(selectCurrentUser);
    const { data: progress } = useGetProgressQuery(knowledgeId, { skip: !user });
    const [updateProgress] = useUpdateProgressMutation();
    const [draft, setDraft] = useState("");
    const [savedAt, setSavedAt] = useState(null);
    const timeoutRef = useRef(null);
    const hydrated = useRef(false);

    useEffect(() => {
        if (progress && !hydrated.current) {
            setDraft(progress.personalNotes || "");
            hydrated.current = true;
        }
    }, [progress]);

    if (!user) return null;

    const handleChange = (e) => {
        const value = e.target.value;
        setDraft(value);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(async () => {
            await updateProgress({ knowledgeId, personalNotes: value });
            setSavedAt(new Date());
        }, SAVE_DELAY_MS);
    };

    return (
        <section>
            <div className="mb-2 flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">My Notes</h2>
                {savedAt && <span className="text-xs text-muted-foreground">Saved</span>}
            </div>
            <Textarea
                value={draft}
                onChange={handleChange}
                placeholder="What's your own take on this? Mistakes you made, things that finally made it click..."
                className="min-h-24"
            />
        </section>
    );
}
