import jwt from "jsonwebtoken";

import appConfig from "../../../constants/appConfig";

class AuthServices {
  generateJwt(payload, expires) {
    return jwt.sign(payload, appConfig.jwtSecret, { expiresIn: expires });
  }
}

export default new AuthServices();
