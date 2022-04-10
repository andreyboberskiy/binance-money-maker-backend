import { validationResult } from "express-validator";
import ApiError from "../exceptions/api-error";

const checkRouteValidation = (req) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const mappedErrors = errors.array().reduce((accum, error) => {
      if (error.nestedErrors) {
        error.nestedErrors.forEach((e) => {
          accum[e.param] = e.msg;
        });
      } else {
        accum[error.param] = error.msg;
      }

      return accum;
    }, {});

    throw ApiError.BadRequest("Validation failed", mappedErrors);
  }
};

export default (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    checkRouteValidation(req);

    next();
  } catch (e) {
    next(e);
  }
};
