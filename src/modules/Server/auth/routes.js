import { Router } from "express";

import validationMiddleware from "../../../middlewares/validation.middleware.js";
import routesNames from "../../../constants/routesNames.js";

import controllers from "./controllers.js";
import * as validation from "./validation.js";

const authRoutes = Router();

authRoutes.post(
  routesNames.auth.login,
  validation.login,
  validationMiddleware,
  controllers.login
);
authRoutes.post(
  routesNames.auth.signUp,
  validation.signUp,
  validationMiddleware,
  controllers.signUp
);
authRoutes.post(
  routesNames.auth.refreshToken,
  validation.refreshToken,
  validationMiddleware,
  controllers.refreshToken
);

export default authRoutes;
