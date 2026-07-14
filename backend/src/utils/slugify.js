export const slugify = (text) =>
    text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

// Generates a unique slug for `model` by appending -2, -3, ... on collision.
// `excludeId` lets updates keep their own slug without colliding with themselves.
export const generateUniqueSlug = async (model, title, excludeId = null) => {
    const base = slugify(title);
    let slug = base;
    let suffix = 2;

    while (
        await model.exists({
            slug,
            ...(excludeId ? { _id: { $ne: excludeId } } : {}),
        })
    ) {
        slug = `${base}-${suffix}`;
        suffix += 1;
    }

    return slug;
};
