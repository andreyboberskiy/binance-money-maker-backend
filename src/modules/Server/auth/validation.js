import { check } from "express-validator";

export const login = [
  check("email", "Email must be a correct email").isEmail(),
  check(["email", "password"], "Field is invalid").isString().notEmpty(),
];

export const signUp = [
  check("email", "Email must be a correct email").isEmail(),
  check(
    ["email", "password", "accessKey", "secretKey"],
    "Field must be a string"
  ).isString(),
  check(
    ["email", "password", "accessKey", "secretKey"],
    "Field is required"
  ).notEmpty(),
];
export const refreshToken = [
  check("refreshToken", "Token is invalid").isString().notEmpty(),
];
