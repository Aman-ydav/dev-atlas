import { useSelector } from "react-redux";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { BookmarkIcon, HeartIcon, InfoIcon, PinIcon, RotateCcwIcon } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { selectCurrentUser } from "@/store/slices/authSlice";
import {
    useGetProgressQuery,
    useMarkForRevisionMutation,
    useSubmitRevisionMutation,
    useUpdateProgressMutation,
} from "@/store/api/progressApi";

const RESULTS = [
    { key: "forgot", label: "Forgot" },
    { key: "shaky", label: "Shaky" },
    { key: "confident", label: "Confident" },
];

// Base UI's <Select.Value> renders the raw value unless the Root is given an
// `items` map — without it, the trigger showed "in_progress" verbatim while
// the open popup (which reads SelectItem's own children) correctly showed
// "In progress". Passing this as `items` fixes the trigger; the map is also
// reused to build SelectContent below so the label only lives in one place.
const STATUS_LABEL = {
    not_started: "Not started",
    in_progress: "In progress",
    completed: "Completed",
};

// Mirrors backend/src/constants.js REVISION_RELEARNING_MINUTES / REVISION_INTERVAL_DAYS
// — preview-only, so the buttons can show "next review in ~X" before the
// click; the server is the source of truth for the real scheduled value.
const RELEARNING_MINUTES = 10;
const INTERVAL_DAYS = { shaky: [1, 2, 4, 7, 14], confident: [7, 14, 30, 60, 90] };

const previewInterval = (result, level) => {
    if (result === "forgot") return `${RELEARNING_MINUTES}m`;
    if (result === "shaky") return `${INTERVAL_DAYS.shaky[Math.max(level - 1, 0)]}d`;
    return `${INTERVAL_DAYS.confident[Math.min(level + 1, 4)]}d`;
};

export function RevisionControls({ knowledgeId }) {
    const user = useSelector(selectCurrentUser);
    const { data: progress } = useGetProgressQuery(knowledgeId, { skip: !user });
    const [updateProgress] = useUpdateProgressMutation();
    const [markForRevision] = useMarkForRevisionMutation();
    const [submitRevision] = useSubmitRevisionMutation();

    if (!user) return null;

    const toggle = (field) => updateProgress({ knowledgeId, [field]: !progress?.[field] });
    const level = progress?.revision?.level ?? 0;

    const handleResult = async (result) => {
        try {
            const updated = await submitRevision({ knowledgeId, result }).unwrap();
            const when = formatDistanceToNow(new Date(updated.revision.nextRevisionAt), { addSuffix: true });
            toast.success(`Scheduled for review ${when}`);
        } catch (error) {
            toast.error(error.message || "Couldn't record that");
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-3">
            <Select
                items={STATUS_LABEL}
                value={progress?.status || "not_started"}
                onValueChange={(status) => updateProgress({ knowledgeId, status })}
            >
                <SelectTrigger size="sm" className="w-36">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(STATUS_LABEL).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="flex items-center gap-1 border-l border-border pl-4">
                <IconToggle
                    label="Bookmark"
                    icon={BookmarkIcon}
                    pressed={!!progress?.isBookmarked}
                    onPressedChange={() => toggle("isBookmarked")}
                />
                <IconToggle
                    label="Favorite"
                    icon={HeartIcon}
                    pressed={!!progress?.isFavorite}
                    onPressedChange={() => toggle("isFavorite")}
                />
                <IconToggle
                    label="Pin"
                    icon={PinIcon}
                    pressed={!!progress?.isPinned}
                    onPressedChange={() => toggle("isPinned")}
                />
                <IconToggle
                    label="Mark for revision"
                    icon={RotateCcwIcon}
                    pressed={!!progress?.revision?.isMarkedForRevision}
                    onPressedChange={() =>
                        markForRevision({
                            knowledgeId,
                            marked: !progress?.revision?.isMarkedForRevision,
                        })
                    }
                />
            </div>

            {progress?.revision?.isMarkedForRevision && (
                <div className="flex flex-wrap items-center gap-1.5 border-l border-border pl-4 text-xs">
                    <span className="text-muted-foreground">How well did you recall this?</span>
                    <Tooltip>
                        <TooltipTrigger render={<InfoIcon className="size-3.5 text-muted-foreground" />} />
                        <TooltipContent className="max-w-56">
                            Confident pushes this further out each time (7d, then 14, 30, 60, 90). Forgot resets it
                            and brings it back in {RELEARNING_MINUTES} minutes so you can retry it soon.
                        </TooltipContent>
                    </Tooltip>
                    {RESULTS.map((r) => (
                        <Button key={r.key} size="sm" variant="outline" onClick={() => handleResult(r.key)}>
                            {r.label}
                            <span className="text-muted-foreground">· {previewInterval(r.key, level)}</span>
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}

function IconToggle({ label, icon: Icon, pressed, onPressedChange }) {
    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Toggle
                        aria-label={label}
                        pressed={pressed}
                        onPressedChange={onPressedChange}
                        size="sm"
                    />
                }
            >
                <Icon className={pressed ? "fill-current" : ""} />
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}
