import ApiError from "../utils/ApiError.js";// adjust path accordingly

export const errorHandler = (err, req, res, next) => {
  // `next` is here so Express recognizes this as an error middleware
  console.error(err.stack);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Fallback for unknown errors
  return res.status(500).json({
    success: false,
    status: 500,
    message: err.message || "Internal server error",
    errors: [],
    data: null,
  });
};
