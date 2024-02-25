import joi from "joi";
import { isValidObjectID } from "../../middleware/validation.middleware.js";

export const createOrder = joi
  .object({
    payment: joi.string().valid("cash", "visa"),
    phone: joi.string().required(),
    address: joi.string().required(),
    coupon: joi.string(),
  })
  .required();

export const cancelOrder = joi
  .object({
    id: joi.string().custom(isValidObjectID).required(),
  })
  .required();
