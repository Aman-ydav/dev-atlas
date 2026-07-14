import { ApiError } from "../utils/apiError.js";

// Validates req[source] against a zod schema, replacing it with the parsed
// (and therefore coerced/defaulted) value on success.
export const validate = (schema, source = "body") => (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
        const errors = result.error.issues.map(
            (issue) => `${issue.path.join(".")}: ${issue.message}`
        );
        throw new ApiError(400, "Validation failed", errors);
    }

    req[source] = result.data;
    next();
};
