import Joi from "joi";

export const createCoupon = Joi.object({
  discount: Joi.number().integer().min(1).max(100).required(),
  expiredAt: Joi.date().greater(Date.now()).required(),
}).required();

export const updateCoupon = Joi.object({
  discount: Joi.number().integer().min(1).max(100),
  expiredAt: Joi.date().greater(Date.now()),
  code: Joi.string().length(5).required(),
}).required();
export const deleteCoupon = Joi.object({
  code: Joi.string().length(5).required(),
}).required();
