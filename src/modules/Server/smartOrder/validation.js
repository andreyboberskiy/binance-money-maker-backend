import { check, oneOf } from "express-validator";

export const create = [
  oneOf([
    [
      check(
        "buySecondary",
        "Specify amount for buy in primary or secondary currency"
      ).notEmpty(),
      check("buySecondary", "Field must be a number")
        .isNumeric()
        .not()
        .isString()
        .isFloat({ min: 0.0001, max: 100 })
        .withMessage("Minimum 0.0001, maximum 100"),
    ],
    [
      check(
        "buyPrimary",
        "Specify amount for buy in primary or secondary currency"
      ).notEmpty(),
      check("buyPrimary", "Field must be a number")
        .isNumeric()
        .not()
        .isString()
        .isFloat({ min: 0.0001, max: 100 })
        .withMessage("Minimum 0.0001, maximum 100"),
    ],
  ]),

  check(
    ["updateFixRatePercent", "sellingPercent", "stopLossPercent", "direction"],
    "Field is required"
  ).notEmpty(),

  check(
    ["updateFixRatePercent", "stopLossPercent", "sellingPercent"],
    "Field must be a number"
  )
    .isNumeric()
    .not()
    .isString()
    .isFloat({ min: 0.1, max: 50 })
    .withMessage("Minimum 0.1, maximum 100"),
  check(["direction"], "Field must be a string").isString(),
];
