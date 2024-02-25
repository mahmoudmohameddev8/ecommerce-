import Joi from "joi";
import { isValidObjectID } from "../../middleware/validation.middleware.js";

export const createSubcategory = Joi.object({
  name: Joi.string().min(5).max(20).required(),
  category: Joi.string().custom(isValidObjectID).required(),
}).required();

export const updateSubcategory = Joi.object({
  name: Joi.string().min(5).max(20),
  id: Joi.string().custom(isValidObjectID).required(),
  category: Joi.string().custom(isValidObjectID).required(),
}).required();
export const deleteSubcategory = Joi.object({
  id: Joi.string().custom(isValidObjectID).required(),
  category: Joi.string().custom(isValidObjectID).required(),
}).required();
export const allSubcategories = Joi.object({
  category: Joi.string().custom(isValidObjectID),
});
