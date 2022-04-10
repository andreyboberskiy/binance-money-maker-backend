import mongoose from "mongoose";

import Mixpanel from "../../libs/Mixpanel/index.js";
import appConfig from "../../constants/appConfig.js";

class Database {
  async init() {
    try {
      await mongoose.connect(appConfig.mongoDBUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log("MongoDB connected");
    } catch (e) {
      Mixpanel.sendError("Mongoose connect error", e);
    }
  }
}

export default new Database();
