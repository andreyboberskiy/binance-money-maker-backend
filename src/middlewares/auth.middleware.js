import jwt from "jsonwebtoken";

import AppConfig from "../constants/appConfig";

export default (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not Authorized" });
    }

    const decoded = jwt.verify(token, AppConfig.jwtSecret);

    req.body.userId = decoded.userId;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Not Authorized" });
  }
};
