import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { TypeBadge } from "@/components/knowledge/TypeBadge";
import { useLazySearchQuery } from "@/store/api/searchApi";

export function SearchPalette({ open, onOpenChange }) {
    const [query, setQuery] = useState("");
    const [trigger, { data, isFetching }] = useLazySearchQuery();
    const navigate = useNavigate();

    useEffect(() => {
        if (!open) {
            setQuery("");
            return;
        }
        if (!query.trim()) return;
        const timeout = setTimeout(() => trigger({ q: query, limit: 8 }), 250);
        return () => clearTimeout(timeout);
    }, [query, open, trigger]);

    const goTo = (path) => {
        onOpenChange(false);
        navigate(path);
    };

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange} title="Search DevAtlas" description="Search knowledge cards">
            {/* CommandDialog is just the Dialog shell here — it doesn't wrap children
                in the cmdk store root itself, so Command has to be added explicitly
                (omitting it crashes cmdk internals with "reading 'subscribe'" on undefined). */}
            <Command shouldFilter={false}>
                <CommandInput placeholder="Search concepts, DSA, interview, projects..." value={query} onValueChange={setQuery} />
                <CommandList>
                    {query.trim() && !isFetching && (data?.items?.length ?? 0) === 0 && (
                        <CommandEmpty>No results for "{query}"</CommandEmpty>
                    )}
                    {(data?.items?.length ?? 0) > 0 && (
                        <CommandGroup heading="Results">
                            {data.items.map((item) => (
                                <CommandItem
                                    key={item.slug}
                                    value={item.slug}
                                    onSelect={() => goTo(`/knowledge/${item.slug}`)}
                                >
                                    <TypeBadge type={item.type} />
                                    <span>{item.title}</span>
                                    {item.category?.name && (
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {item.category.name}
                                        </span>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                    {query.trim() && (
                        <CommandGroup heading="More">
                            <CommandItem value="view-all" onSelect={() => goTo(`/search?q=${encodeURIComponent(query)}`)}>
                                View all results for "{query}"
                            </CommandItem>
                        </CommandGroup>
                    )}
                </CommandList>
            </Command>
        </CommandDialog>
    );
}
