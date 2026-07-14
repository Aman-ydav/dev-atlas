import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, index: true },
        parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
        icon: { type: String, default: "folder" },
        description: { type: String, default: "" },
        order: { type: Number, default: 0 },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

categorySchema.index({ parent: 1, order: 1 });

export const Category = mongoose.model("Category", categorySchema);
