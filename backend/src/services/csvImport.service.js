import fs from "fs";
import { parse } from "csv-parse";
import { Knowledge } from "../models/knowledge.model.js";
import { Category } from "../models/category.model.js";
import { Company } from "../models/company.model.js";
import { generateUniqueSlug } from "../utils/slugify.js";

// Expected CSV columns (header row required):
// title,category,difficulty,pattern,tags,companies,externalUrl,constraints,approach
// - category: a Category slug (must already exist)
// - tags: semicolon-separated, e.g. "arrays;two-pointers"
// - companies: semicolon-separated Company slugs, e.g. "google;amazon" (unknown slugs are skipped, not fatal)
export const importDsaCsv = async (filePath, authorId) => {
    const rows = await parseCsvFile(filePath);
    fs.unlink(filePath, () => {});

    const categorySlugs = [...new Set(rows.map((r) => r.category).filter(Boolean))];
    const categories = await Category.find({ slug: { $in: categorySlugs } });
    const categoryBySlug = new Map(categories.map((c) => [c.slug, c._id]));

    const companySlugs = [
        ...new Set(rows.flatMap((r) => (r.companies || "").split(";").map((s) => s.trim()).filter(Boolean))),
    ];
    const companies = await Company.find({ slug: { $in: companySlugs } });
    const companyBySlug = new Map(companies.map((c) => [c.slug, c._id]));

    const report = { created: 0, skipped: 0, errors: [] };

    for (const [index, row] of rows.entries()) {
        const rowNumber = index + 2; // +1 for 0-index, +1 for header row
        try {
            if (!row.title) {
                report.errors.push({ row: rowNumber, reason: "title is required" });
                report.skipped += 1;
                continue;
            }
            const categoryId = categoryBySlug.get(row.category);
            if (!categoryId) {
                report.errors.push({
                    row: rowNumber,
                    reason: `unknown category slug "${row.category}"`,
                });
                report.skipped += 1;
                continue;
            }

            const slug = await generateUniqueSlug(Knowledge, row.title);
            const tags = (row.tags || "")
                .split(";")
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean);
            const companyIds = (row.companies || "")
                .split(";")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((s) => companyBySlug.get(s))
                .filter(Boolean);

            await Knowledge.create({
                title: row.title,
                slug,
                type: "dsa",
                category: categoryId,
                tags,
                difficulty: ["beginner", "intermediate", "advanced"].includes(row.difficulty)
                    ? row.difficulty
                    : "intermediate",
                status: "draft",
                pattern: row.pattern || "",
                externalUrl: row.externalUrl || "",
                constraints: row.constraints || "",
                approach: row.approach || "",
                companies: companyIds,
                author: authorId,
            });

            report.created += 1;
        } catch (error) {
            report.errors.push({ row: rowNumber, reason: error.message });
            report.skipped += 1;
        }
    }

    return report;
};

const parseCsvFile = (filePath) =>
    new Promise((resolve, reject) => {
        const rows = [];
        fs.createReadStream(filePath)
            .pipe(parse({ columns: true, trim: true, skip_empty_lines: true }))
            .on("data", (row) => rows.push(row))
            .on("end", () => resolve(rows))
            .on("error", reject);
    });
