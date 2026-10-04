import { sendError } from "../utils/responseUtils.js";

export const notFoundHandler = (req, res, next) => {
  return sendError(res, 404, `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message || "Validation Error";
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `An account or record with this ${field} already exists`;
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ID format: ${err.value}`;
  }
  return sendError(res, statusCode, message);
};
