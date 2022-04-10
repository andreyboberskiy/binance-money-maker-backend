import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import appConfig from "../../../constants/appConfig";
import ApiError from "../../../exceptions/api-error";
import UserModel from "../../DB/User";

import AuthServices from "./services";

class AuthControllers {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findOne({ email });

      if (!user) {
        throw ApiError.BadRequest("Email or password is incorrect");
      }

      const passwordRight = await bcrypt.compare(password, user.password);

      if (!passwordRight) {
        throw ApiError.BadRequest("Email or password is incorrect");
      }

      const accessToken = AuthServices.generateJwt({ userId: user._id }, "15d");
      const refreshToken = AuthServices.generateJwt(
        { userId: user._id },
        "10d"
      );

      user.refreshToken = refreshToken;
      await user.save();

      return res.status(200).json({ accessToken, refreshToken });
    } catch (e) {
      next(e);
    }
  }
  async signUp(req, res, next) {
    try {
      const { email, password, accessKey, secretKey } = req.body;

      const candidate = await UserModel.findOne({ email });

      if (candidate) {
        throw ApiError.BadRequest("Cant register user with this email");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await UserModel.create({
        email,
        password: hashedPassword,
        accessKey,
        secretKey,
      });
      await user.save();

      return res.status(200).json();
    } catch (e) {
      next(e);
    }
  }
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      let userId;
      try {
        const parsedData = jwt.verify(refreshToken, appConfig.jwtSecret);
        userId = parsedData.userId;
      } catch (e) {
        throw ApiError.BadRequest("Invalid token");
      }
      const user = await UserModel.findById(userId);

      if (!user || user.refreshToken !== refreshToken) {
        throw ApiError.BadRequest("Invalid token");
      }

      const accessToken = AuthServices.generateJwt({ userId: user._id }, "15m");
      const newRefreshToken = AuthServices.generateJwt(
        { userId: user._id },
        "10d"
      );

      user.refreshToken = newRefreshToken;
      await user.save();

      return res
        .status(200)
        .json({ accessToken, refreshToken: newRefreshToken });
    } catch (e) {
      next(e);
    }
  }
}

export default new AuthControllers();
