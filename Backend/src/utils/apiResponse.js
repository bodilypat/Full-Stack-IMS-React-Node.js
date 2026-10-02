/* File: #src/utils/apiResponse.js */

export const successResponse = (
  res,
  data = null,
  message = "Success",
  statusCode = 200,
  meta = null
) => {
  const payload = {
    success: true,
    message,
    data,
  };

  if (meta !== null && meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

export const errorResponse = (
  res,
  message = "Something went wrong",
  statusCode = 500,
  errors = []
) => {
  const payload = {
    success: false,
    message,
    data: null,
  };

  if (Array.isArray(errors) && errors.length > 0) {
    payload.errors = errors;
  } else if (errors && typeof errors === "object") {
    payload.errors = [errors];
  } else {
    payload.errors = [];
  }

  return res.status(statusCode).json(payload);
};
