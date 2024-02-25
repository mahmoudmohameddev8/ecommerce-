import joi from "joi";
import { isValidObjectID } from "../../middleware/validation.middleware.js";

export const addReview = joi
  .object({
    productId: joi.string().custom(isValidObjectID).required(),
    comment: joi.string().required(),
    rating: joi.number().min(1).max(5).required(),
  })
  .required();
