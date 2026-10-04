import { sendError } from "../utils/responseUtils.js";

export const requireAdmin = (req, res, next) => {
  if (!req.user) return sendError(res, 401, "Authentication required");
  if (req.user.role !== "admin") return sendError(res, 403, "Access denied: Admin privileges required");
  next();
};
