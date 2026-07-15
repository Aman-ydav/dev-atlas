import { useState } from "react";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { TypeBadge } from "@/components/knowledge/TypeBadge";
import { useSearchQuery } from "@/store/api/searchApi";

// Search-as-you-type picker for "which other card do you mean" — used by the
// Related Topics and Real Project Example fields, which used to be raw
// slug text inputs (admin had to already know/type the machine slug).
export function KnowledgeCombobox({ value, onSelect, placeholder = "Search cards by title...", excludeSlug }) {
    const [query, setQuery] = useState("");
    const { data, isFetching } = useSearchQuery({ q: query, limit: 8 }, { skip: !query.trim() });
    const items = (data?.items || []).filter((item) => item.slug !== excludeSlug);

    return (
        <Combobox
            items={items}
            inputValue={query}
            onInputValueChange={setQuery}
            onValueChange={(item) => {
                if (item) onSelect(item);
            }}
        >
            <ComboboxInput placeholder={value ? value : placeholder} showClear />
            <ComboboxContent>
                <ComboboxEmpty>{isFetching ? "Searching..." : query.trim() ? "No cards found" : "Type to search"}</ComboboxEmpty>
                <ComboboxList>
                    {items.map((item) => (
                        <ComboboxItem key={item.slug} value={item}>
                            <TypeBadge type={item.type} className="mr-1" />
                            {item.title}
                        </ComboboxItem>
                    ))}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
