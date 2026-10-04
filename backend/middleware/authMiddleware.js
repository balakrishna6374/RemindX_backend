import { verifyToken } from "../utils/jwtUtils.js";
import { User } from "../models/User.js";
import { sendError } from "../utils/responseUtils.js";

export const authenticate = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return sendError(res, 401, "Authentication token missing or invalid");
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) return sendError(res, 401, "Invalid or expired token");
    const user = await User.findById(decoded.id);
    if (!user) return sendError(res, 401, "User account no longer exists");
    if (!user.isActive) return sendError(res, 403, "Account deactivated");
    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, "Authentication failed", error.message);
  }
};
