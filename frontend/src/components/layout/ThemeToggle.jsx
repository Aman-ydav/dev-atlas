import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // next-themes can't know the real theme until after hydration — render a
    // stable placeholder first to avoid a light/dark flash mismatch.
    useEffect(() => setMounted(true), []);

    if (!mounted) return <Button variant="ghost" size="icon" aria-label="Toggle theme" />;

    const isDark = resolvedTheme === "dark";

    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Toggle theme"
                        onClick={() => setTheme(isDark ? "light" : "dark")}
                    />
                }
            >
                {isDark ? <SunIcon /> : <MoonIcon />}
            </TooltipTrigger>
            <TooltipContent>{isDark ? "Switch to light theme" : "Switch to dark theme"}</TooltipContent>
        </Tooltip>
    );
}
