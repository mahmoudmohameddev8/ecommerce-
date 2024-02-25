import Joi from "joi";
import { isValidObjectID } from "../../middleware/validation.middleware.js";

export const createBrand = Joi.object({
  name: Joi.string().min(2).max(12).required(),
  categories: Joi.array()
    .items(Joi.string().custom(isValidObjectID).required())
    .required(),
  subcategories: Joi.array()
    .items(Joi.string().custom(isValidObjectID).required())
    .required(),
}).required();

export const updateBrand = Joi.object({
  name: Joi.string().min(2).max(12),
  id: Joi.string().custom(isValidObjectID).required(),
}).required();
export const deleteBrand = Joi.object({
  id: Joi.string().custom(isValidObjectID).required(),
}).required();
