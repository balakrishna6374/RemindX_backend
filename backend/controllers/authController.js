import { User } from "../models/User.js";
import { generateToken } from "../utils/jwtUtils.js";
import { sendSuccess, sendError } from "../utils/responseUtils.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return sendError(res, 409, "An account with this email already exists");
    const user = await User.create({ name, email: normalizedEmail, password, role: "user", isActive: true });
    const token = generateToken({ id: user._id, role: user.role, email: user.email });
    return sendSuccess(res, 201, "Account registered successfully", {
      token, user: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
    });
  } catch (error) { next(error); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) return sendError(res, 401, "Invalid email or password");
    if (!user.isActive) return sendError(res, 403, "Account is deactivated");
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, 401, "Invalid email or password");
    const token = generateToken({ id: user._id, role: user.role, email: user.email });
    return sendSuccess(res, 200, "Logged in successfully", {
      token, user: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
    });
  } catch (error) { next(error); }
};

export const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, "User profile retrieved", {
      user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, isActive: req.user.isActive },
    });
  } catch (error) { next(error); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return sendError(res, 404, "User not found");
    if (name) user.name = name.trim();
    if (newPassword) {
      if (!currentPassword) return sendError(res, 400, "Current password required");
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) return sendError(res, 400, "Current password incorrect");
      user.password = newPassword;
    }
    await user.save();
    return sendSuccess(res, 200, "Profile updated successfully", { user });
  } catch (error) { next(error); }
};
