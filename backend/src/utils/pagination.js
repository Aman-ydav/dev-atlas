import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../constants.js";

export const parsePagination = (query) => {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(
        Math.max(parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE, 1),
        MAX_PAGE_SIZE
    );
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

export const buildPaginatedResponse = (items, total, page, limit) => ({
    items,
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
});
