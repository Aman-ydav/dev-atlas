import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    CompassIcon,
    DumbbellIcon,
    FolderKanbanIcon,
    MessageSquareTextIcon,
    LibraryIcon,
    SearchIcon,
    NetworkIcon,
    RotateCcwIcon,
    HighlighterIcon,
    WorkflowIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { PageLoader } from "@/components/shared/PageLoader";
import { useGetMeQuery } from "@/store/api/authApi";

const MODULES = [
    { icon: CompassIcon, name: "Explore", description: "Every concept you've learned, browsable by category — not folders." },
    { icon: DumbbellIcon, name: "Practice", description: "DSA questions by pattern, difficulty, and company, with your own notes." },
    { icon: FolderKanbanIcon, name: "Projects", description: "Real engineering case studies — architecture, decisions, lessons learned." },
    { icon: MessageSquareTextIcon, name: "Interview", description: "Prep that links straight back to the concepts and projects behind it." },
    { icon: LibraryIcon, name: "Resources", description: "Docs, articles, and videos attached to the knowledge they support." },
    { icon: SearchIcon, name: "Search", description: "One index across everything you know, ranked and faceted." },
];

const PRINCIPLES = [
    { icon: NetworkIcon, title: "One engine, not four", body: "A Promise, a Morris Traversal, JWT, and a project called Roomezy are all the same object underneath: a Knowledge Card. Same layout, same engine, every time." },
    { icon: RotateCcwIcon, title: "Revision that respects your time", body: "Mark something for revision, rate your recall, and it resurfaces on its own schedule. No streaks to keep, no guilt for missing a day." },
    { icon: HighlighterIcon, title: "Built for reading, not skimming", body: "Highlight while you read, attach a note, and come back to exactly what mattered — on the card itself, not a separate notes app." },
    { icon: WorkflowIcon, title: "A knowledge graph, not a wiki", body: "Every card links to what it depends on, what it's used in, and its alternatives — so one search turns into a trail you can actually follow." },
];

export default function LandingPage() {
    const { data: user, isLoading } = useGetMeQuery();

    if (isLoading) return <PageLoader />;
    if (user) return <Navigate to="/dashboard" replace />;

    return (
        <div className="landing-scope min-h-svh w-full">
            <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
                <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                        DA
                    </span>
                    <span className="text-sm font-semibold">DevAtlas</span>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Button size="sm" nativeButton={false} render={<Link to="/login" />}>
                        Sign in
                    </Button>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6">
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="py-16 text-center sm:py-24"
                >
                    <h1>Your engineering knowledge, in one connected system.</h1>
                    <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
                        DevAtlas isn't a note app. Every concept, DSA problem, interview topic, and project
                        case study is the same kind of object — connected, revisable, and built to last
                        your whole career.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-3">
                        <Button size="lg" nativeButton={false} render={<Link to="/login" />}>
                            Get started
                        </Button>
                        <Button size="lg" variant="outline" nativeButton={false} render={<a href="#modules" />}>
                            See how it works
                        </Button>
                    </div>
                </motion.section>

                <section id="modules" className="py-12 sm:py-16">
                    <h2 className="text-center text-lg font-semibold text-foreground">
                        One navigation. Every kind of knowledge.
                    </h2>
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {MODULES.map((mod, i) => (
                            <motion.div
                                key={mod.name}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
                                className="rounded-xl border border-border p-5"
                            >
                                <mod.icon className="size-5 text-muted-foreground" />
                                <h3 className="mt-3 text-sm font-semibold text-foreground">{mod.name}</h3>
                                <p className="mt-1.5 text-sm text-muted-foreground">{mod.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="border-t border-border py-12 sm:py-16">
                    <h2 className="text-center text-lg font-semibold text-foreground">
                        A few things we believe in
                    </h2>
                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {PRINCIPLES.map((p, i) => (
                            <motion.div
                                key={p.title}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
                                className="flex gap-3"
                            >
                                <p.icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="border-t border-border py-12 text-center sm:py-16">
                    <h2 className="text-lg font-semibold text-foreground">
                        No streaks. No XP. No leaderboards.
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                        DevAtlas is a knowledge system, not a habit-tracking app. It's designed to still be
                        useful ten years into your career — not to keep you clicking today.
                    </p>
                    <div className="mt-6">
                        <Button size="lg" nativeButton={false} render={<Link to="/login" />}>
                            Sign in with Google or GitHub
                        </Button>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
                DevAtlas — a developer operating system, built one card at a time.
            </footer>
        </div>
    );
}
