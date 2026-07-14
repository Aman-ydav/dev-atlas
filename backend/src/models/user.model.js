import mongoose, { Schema } from "mongoose";
import { USER_ROLES, OAUTH_PROVIDERS } from "../constants.js";

const providerSchema = new Schema(
    {
        provider: { type: String, enum: OAUTH_PROVIDERS, required: true },
        providerId: { type: String, required: true },
    },
    { _id: false }
);

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        avatarUrl: { type: String, default: "" },
        role: { type: String, enum: USER_ROLES, default: "user" },

        providers: { type: [providerSchema], default: [] },

        refreshTokenHash: { type: String, default: null, select: false },

        bio: { type: String, default: "" },
        headline: { type: String, default: "" },
        socialLinks: {
            github: { type: String, default: "" },
            linkedin: { type: String, default: "" },
            twitter: { type: String, default: "" },
            website: { type: String, default: "" },
        },
        recentSearches: { type: [String], default: [] },

        isActive: { type: Boolean, default: true },
        lastLoginAt: { type: Date },
    },
    { timestamps: true }
);

userSchema.index(
    { "providers.provider": 1, "providers.providerId": 1 },
    { unique: true, sparse: true }
);

userSchema.methods.pushRecentSearch = function pushRecentSearch(query) {
    this.recentSearches = [
        query,
        ...this.recentSearches.filter((q) => q !== query),
    ].slice(0, 10);
};

export const User = mongoose.model("User", userSchema);
