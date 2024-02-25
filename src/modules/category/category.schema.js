import Joi from "joi";
import { isValidObjectID } from "../../middleware/validation.middleware.js";

export const createCategory = Joi.object({
  name: Joi.string().min(5).max(20).required(),
}).required();

export const updateCategory = Joi.object({
  name: Joi.string().min(5).max(20),
  id: Joi.string().custom(isValidObjectID).required(),
}).required();

export const deleteCategory = Joi.object({
  id: Joi.string().custom(isValidObjectID).required(),
}).required();
