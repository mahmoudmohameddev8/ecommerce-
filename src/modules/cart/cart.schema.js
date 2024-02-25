import Joi from "joi";
import { isValidObjectID } from "../../middleware/validation.middleware.js";

export const addToCart = Joi.object({
  productId: Joi.string().custom(isValidObjectID).required(),
  quantity: Joi.number().integer().min(1).required(),
}).required();

export const getCart = Joi.object({
  cartId: Joi.string().custom(isValidObjectID),
});
export const updateCart = Joi.object({
  productId: Joi.string().custom(isValidObjectID).required(),
  quantity: Joi.number().integer().min(1).required(),
}).required();
export const removeFromCart = Joi.object({
  productId: Joi.string().custom(isValidObjectID).required(),
}).required();
