// One-off migration: converts any ProjectKnowledge doc still using the old
// 4 fixed markdown fields (architectureNotes/databaseNotes/apiNotes/
// deploymentNotes) into an initial sections[] entry, then removes the old
// fields. Idempotent — safe to re-run; skips any doc that already has
// sections. Run once, in the same deploy as the schema change:
//   node src/scripts/migrateProjectSections.js
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../db/index.js";
import { Knowledge } from "../models/knowledge.model.js";

const LEGACY_FIELDS = [
    ["architectureNotes", "Architecture"],
    ["databaseNotes", "Database"],
    ["apiNotes", "API"],
    ["deploymentNotes", "Deployment"],
];

const run = async () => {
    await connectDB();

    const docs = await Knowledge.find({ type: "project" }).select(
        "sections architectureNotes databaseNotes apiNotes deploymentNotes"
    );

    let migrated = 0;
    for (const doc of docs) {
        if (doc.sections?.length) continue;

        const sections = LEGACY_FIELDS.filter(([field]) => doc[field]?.trim()).map(([field, title]) => ({
            title,
            body: doc[field],
        }));

        if (!sections.length) continue;

        await Knowledge.updateOne(
            { _id: doc._id },
            {
                $set: { sections },
                $unset: { architectureNotes: 1, databaseNotes: 1, apiNotes: 1, deploymentNotes: 1 },
            }
        );
        migrated += 1;
    }

    console.log(`Checked ${docs.length} project card(s), migrated ${migrated} to sections[].`);

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
});
