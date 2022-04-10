import Mixpanel from "../libs/Mixpanel/index.js";
import ApiError from "../exceptions/api-error.js";

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ message: err.message, errors: err.errors });
  }
  Mixpanel.sendError("Internal error", err);

  console.log(err);
  return res.status(500).json({
    message: "Internal Server Error. Not instance of apiError",
    error: err,
  });
};
export default errorMiddleware;
