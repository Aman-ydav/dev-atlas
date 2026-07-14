import mongoose, { Schema } from "mongoose";

const companySchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, index: true },
        logoUrl: { type: String, default: "" },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

export const Company = mongoose.model("Company", companySchema);
