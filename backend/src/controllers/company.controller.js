import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Company } from "../models/company.model.js";
import { generateUniqueSlug } from "../utils/slugify.js";

const getCompanies = asyncHandler(async (req, res) => {
    const { q } = req.query;
    const filter = { isDeleted: false };
    if (q) filter.name = { $regex: q, $options: "i" };

    const companies = await Company.find(filter).sort({ name: 1 });

    return res
        .status(200)
        .json(new ApiResponse(200, companies, "Companies fetched"));
});

const createCompany = asyncHandler(async (req, res) => {
    const slug = await generateUniqueSlug(Company, req.body.name);
    const company = await Company.create({ ...req.body, slug });

    return res
        .status(201)
        .json(new ApiResponse(201, company, "Company created"));
});

const updateCompany = asyncHandler(async (req, res) => {
    const company = await Company.findOne({ _id: req.params.id, isDeleted: false });
    if (!company) throw new ApiError(404, "Company not found");

    Object.assign(company, req.body);
    await company.save();

    return res
        .status(200)
        .json(new ApiResponse(200, company, "Company updated"));
});

const deleteCompany = asyncHandler(async (req, res) => {
    const company = await Company.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        { isDeleted: true, deletedAt: new Date() }
    );
    if (!company) throw new ApiError(404, "Company not found");

    return res.status(204).end();
});

export { getCompanies, createCompany, updateCompany, deleteCompany };
