import { useSelector } from "react-redux";
import { BookmarkIcon, HeartIcon, PinIcon, RotateCcwIcon } from "lucide-react";
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

export function RevisionControls({ knowledgeId }) {
    const user = useSelector(selectCurrentUser);
    const { data: progress } = useGetProgressQuery(knowledgeId, { skip: !user });
    const [updateProgress] = useUpdateProgressMutation();
    const [markForRevision] = useMarkForRevisionMutation();
    const [submitRevision] = useSubmitRevisionMutation();

    if (!user) return null;

    const toggle = (field) => updateProgress({ knowledgeId, [field]: !progress?.[field] });

    return (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-3">
            <Select
                value={progress?.status || "not_started"}
                onValueChange={(status) => updateProgress({ knowledgeId, status })}
            >
                <SelectTrigger size="sm" className="w-36">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="not_started">Not started</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
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
                <div className="flex items-center gap-1.5 border-l border-border pl-4 text-xs">
                    <span className="text-muted-foreground">How well did you recall this?</span>
                    {RESULTS.map((r) => (
                        <Button
                            key={r.key}
                            size="sm"
                            variant="outline"
                            onClick={() => submitRevision({ knowledgeId, result: r.key })}
                        >
                            {r.label}
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
