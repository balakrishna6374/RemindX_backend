import { User } from "../models/User.js";
import { sendSuccess, sendError } from "../utils/responseUtils.js";

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 404, "User not found");
    return sendSuccess(res, 200, "User profile", user);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 404, "User not found");
    if (name) user.name = name.trim();
    await user.save();
    return sendSuccess(res, 200, "Profile updated", user);
  } catch (error) {
    next(error);
  }
};
