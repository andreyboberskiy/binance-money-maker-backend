import { Router } from "express";

import routesNames from "../../../constants/routesNames";
import authMiddleware from "../../../middlewares/auth.middleware";
import validationMiddleware from "../../../middlewares/validation.middleware";
import controllers from "./controllers";

import * as validation from "./validation";

const smartOrderRoutes = Router();

smartOrderRoutes.post(
  routesNames.smartOrder.create,
  authMiddleware,
  validation.create,
  validationMiddleware,
  controllers.create
);

export default smartOrderRoutes;
