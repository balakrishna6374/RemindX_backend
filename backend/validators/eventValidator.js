import Joi from "joi";

const categories = ["CERTIFICATE", "IDENTITY", "VEHICLE", "INSURANCE", "FINANCIAL", "SUBSCRIPTION", "HEALTH", "EDUCATION", "APPOINTMENT", "WARRANTY", "GOVERNMENT", "LICENSE", "DOCUMENT", "OTHER"];
const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const createEventSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().max(2000).allow("").optional(),
  eventDate: Joi.date().iso().required(),
  category: Joi.string().valid(...categories).default("OTHER"),
  priority: Joi.string().valid(...priorities).default("MEDIUM"),
});

export const updateEventSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  description: Joi.string().trim().max(2000).allow("").optional(),
  eventDate: Joi.date().iso().optional(),
  category: Joi.string().valid(...categories).optional(),
  priority: Joi.string().valid(...priorities).optional(),
}).min(1);
