import { ApiError } from "../utils/apiError.js";

// Normalizes thrown errors (ApiError, Mongoose errors, or anything unexpected)
// into a single ApiError-shaped JSON response. Registered LAST in app.js.
const errorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {}).join(", ") || "field";
        error = new ApiError(409, `Duplicate value for ${field}`, [], err.stack);
    }

    const response = {
        statusCode: error.statusCode,
        success: false,
        message: error.message,
        errors: error.errors,
        data: null,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    };

    return res.status(error.statusCode).json(response);
};

export { errorHandler };
