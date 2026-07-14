import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Category } from "../models/category.model.js";
import { Knowledge } from "../models/knowledge.model.js";
import { generateUniqueSlug } from "../utils/slugify.js";

const buildTree = (categories, parent = null) =>
    categories
        .filter((c) => String(c.parent) === String(parent))
        .sort((a, b) => a.order - b.order)
        .map((c) => ({ ...c.toObject(), children: buildTree(categories, c._id) }));

const getCategories = asyncHandler(async (req, res) => {
    const { tree, parent } = req.query;
    const filter = { isDeleted: false };

    if (!tree && parent !== undefined) {
        filter.parent = parent === "null" ? null : parent;
    }

    const categories = await Category.find(filter).sort({ order: 1 });

    const data = tree === "true" ? buildTree(categories, null) : categories;

    return res
        .status(200)
        .json(new ApiResponse(200, data, "Categories fetched"));
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
    const category = await Category.findOne({
        slug: req.params.slug,
        isDeleted: false,
    });
    if (!category) throw new ApiError(404, "Category not found");

    const children = await Category.find({
        parent: category._id,
        isDeleted: false,
    }).sort({ order: 1 });

    return res
        .status(200)
        .json(new ApiResponse(200, { ...category.toObject(), children }, "Category fetched"));
});

const createCategory = asyncHandler(async (req, res) => {
    const slug = await generateUniqueSlug(Category, req.body.name);
    const category = await Category.create({ ...req.body, slug });

    return res
        .status(201)
        .json(new ApiResponse(201, category, "Category created"));
});

const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
    if (!category) throw new ApiError(404, "Category not found");

    Object.assign(category, req.body);
    await category.save();

    return res
        .status(200)
        .json(new ApiResponse(200, category, "Category updated"));
});

const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
    if (!category) throw new ApiError(404, "Category not found");

    const [childCount, cardCount] = await Promise.all([
        Category.countDocuments({ parent: category._id, isDeleted: false }),
        Knowledge.countDocuments({
            category: category._id,
            status: "published",
            isDeleted: false,
        }),
    ]);

    if (childCount > 0 || cardCount > 0) {
        throw new ApiError(
            409,
            "Cannot delete a category that still has subcategories or published cards"
        );
    }

    category.isDeleted = true;
    category.deletedAt = new Date();
    await category.save();

    return res.status(204).end();
});

export {
    getCategories,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
};
