import joi from "joi";
import { isValidObjectID } from "./../..//middleware/validation.middleware.js";

export const createProduct = joi
  .object({
    name: joi.string().min(2).max(20).required(),
    description: joi.string().min(10).max(200),
    avaliableItems: joi.number().integer().min(1),
    price: joi.number().integer().min(1).required(),
    discount: joi.number().integer().min(0).max(100),
    brand: joi.string().custom(isValidObjectID).required(),
    category: joi.string().custom(isValidObjectID).required(),
    subcategory: joi.string().custom(isValidObjectID).required(),
  })
  .required();

export const deleteProduct = joi
  .object({
    id: joi.string().custom(isValidObjectID).required(),
  })
  .required();
