import Joi from "joi";

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  currentPassword: Joi.string().optional(),
  newPassword: Joi.string().min(6).max(128).optional(),
  confirmNewPassword: Joi.any().optional(),
}).min(1);

export const adminUpdateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  role: Joi.string().valid("user", "admin").optional(),
  isActive: Joi.boolean().optional(),
  password: Joi.string().min(6).max(128).optional(),
}).min(1);
