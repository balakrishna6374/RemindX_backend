export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = { success: true, message, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

export const sendError = (res, statusCode = 500, message = 'An error occurred', errors = null) => {
  const response = {
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : errors ? [errors] : [],
  };
  return res.status(statusCode).json(response);
};
