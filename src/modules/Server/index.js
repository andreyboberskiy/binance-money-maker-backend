import express from "express";

import routesNames from "../../constants/routesNames.js";
import errorMiddleware from "../../middlewares/error.middleware.js";
import appConfig from "../../constants/appConfig.js";

import authRoutes from "./auth/routes.js";
import smartOrderRoutes from "./smartOrder/routes.js";

const app = express();
app.use(express.json());

// app.use(cors());

app.use(routesNames.auth.index, authRoutes);
app.use(routesNames.smartOrder.index, smartOrderRoutes);

app.use(errorMiddleware);

class Server {
  start() {
    app.listen(appConfig.port, () => {
      console.log("Server started on port: ", appConfig.port);
    });
  }
}

export default new Server();
