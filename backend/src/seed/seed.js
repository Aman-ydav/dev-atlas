// Seeds the Explore taxonomy's top-level categories and (optionally) promotes
// an already-logged-in user to admin by email. Run once after first deploy:
//   npm run seed
//   ADMIN_EMAIL=you@example.com npm run seed   (also promotes that user to admin)
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../db/index.js";
import { Category } from "../models/category.model.js";
import { User } from "../models/user.model.js";
import { slugify } from "../utils/slugify.js";

const TOP_LEVEL_CATEGORIES = [
    { name: "Frontend", icon: "layout-panel-left" },
    { name: "Backend", icon: "server" },
    { name: "DSA", icon: "binary" },
    { name: "Database", icon: "database" },
    { name: "Operating System", icon: "cpu" },
    { name: "Computer Networks", icon: "network" },
    { name: "AI", icon: "brain-circuit" },
    { name: "System Design", icon: "workflow" },
    { name: "Projects", icon: "folder-kanban" },
    { name: "Interview", icon: "message-square-text" },
    { name: "Misc", icon: "shapes" },
];

const run = async () => {
    await connectDB();

    for (const [index, category] of TOP_LEVEL_CATEGORIES.entries()) {
        const slug = slugify(category.name);
        await Category.findOneAndUpdate(
            { slug },
            { ...category, slug, parent: null, order: index },
            { upsert: true, new: true }
        );
    }
    console.log(`Seeded ${TOP_LEVEL_CATEGORIES.length} top-level categories.`);

    if (process.env.ADMIN_EMAIL) {
        const user = await User.findOneAndUpdate(
            { email: process.env.ADMIN_EMAIL.toLowerCase() },
            { role: "admin" },
            { new: true }
        );
        if (user) {
            console.log(`Promoted ${user.email} to admin.`);
        } else {
            console.log(
                `No user found with email ${process.env.ADMIN_EMAIL} — log in once via Google/GitHub first, then re-run seed.`
            );
        }
    }

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
});
