import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import passport from "./config/passport.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { uploadLimiter, readLimiter, writeLimiter } from "./middlewares/rateLimiter.middleware.js";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import categoryRouter from "./routes/category.routes.js";
import companyRouter from "./routes/company.routes.js";
import knowledgeRouter from "./routes/knowledge.routes.js";
import resourceRouter from "./routes/resource.routes.js";
import uploadRouter from "./routes/upload.routes.js";
import searchRouter from "./routes/search.routes.js";
import progressRouter from "./routes/progress.routes.js";
import annotationRouter from "./routes/annotation.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import activityRouter from "./routes/activity.routes.js";

const app = express();

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins.length ? allowedOrigins : true,
        credentials: true,
    })
);
// 16kb (the original boilerplate default) is fine for simple form-shaped
// payloads, but a single rich Knowledge Card — full markdown explanation,
// several code examples, mistakes, interview Q&As — routinely runs 20-30kb+
// as JSON. Actual file uploads go through the separate multipart /uploads
// route (multer), not this JSON body parser, so 2mb is plenty of headroom
// for pure text/JSON without opening the door to large binary payloads here.
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(passport.initialize());

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.get("/api/v1/health", (req, res) => res.status(200).json({ status: "ok" }));

// authLimiter (strict, abuse-prevention) is applied per-route inside auth.routes.js
// to the unauthenticated OAuth endpoints only — /me and /logout need a valid JWT
// already, so they use the same general limiter as other authenticated routes.
app.use("/api/v1/auth", writeLimiter, authRouter);
app.use("/api/v1/users", writeLimiter, userRouter);
app.use("/api/v1/categories", readLimiter, categoryRouter);
app.use("/api/v1/companies", readLimiter, companyRouter);
app.use("/api/v1/knowledge", readLimiter, knowledgeRouter);
app.use("/api/v1/resources", readLimiter, resourceRouter);
app.use("/api/v1/uploads", uploadLimiter, uploadRouter);
app.use("/api/v1/search", readLimiter, searchRouter);
app.use("/api/v1/progress", writeLimiter, progressRouter);
app.use("/api/v1/annotations", writeLimiter, annotationRouter);
app.use("/api/v1/dashboard", writeLimiter, dashboardRouter);
app.use("/api/v1/activities", writeLimiter, activityRouter);

app.use(errorHandler);

export { app };
