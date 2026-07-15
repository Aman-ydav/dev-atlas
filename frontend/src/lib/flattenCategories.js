// Flattens the nested category tree (as returned by GET /categories?tree=true)
// into a depth-annotated list, so <select>-style pickers can offer every
// category — including subcategories like "JavaScript" under "Frontend" —
// not just the top level.
export const flattenCategories = (nodes, depth = 0) =>
    (nodes || []).flatMap((node) => [
        { ...node, depth },
        ...flattenCategories(node.children || [], depth + 1),
    ]);
