import { sendError } from "../utils/responseUtils.js";

export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const errors = error.details.map((d) => d.message);
      return sendError(res, 400, "Validation Error", errors);
    }
    req.body = value;
    next();
  };
};
