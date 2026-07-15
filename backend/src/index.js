// Must be the first import: ES module imports are hoisted and evaluated
// before any of this file's own top-level code runs, so a plain
// `import dotenv from "dotenv"` + later `dotenv.config()` call would still
// load ./app.js (and therefore config/passport.js, which reads
// process.env.GOOGLE_CLIENT_ID etc. at module-load time) before the env
// vars were ever populated. "dotenv/config" runs config() as a side effect
// of being imported, so putting it first guarantees it runs first too.
import "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`DevAtlas API running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    });
