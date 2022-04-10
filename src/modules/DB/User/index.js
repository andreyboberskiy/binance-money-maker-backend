import mongoose from "mongoose";

const UsersSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    accessKey: { type: String, required: true },
    secretKey: { type: String, required: true },

    refreshToken: { type: String },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("Users", UsersSchema);
export default UserModel;
