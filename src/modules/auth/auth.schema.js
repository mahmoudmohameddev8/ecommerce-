import Joi from "joi";

export const register = Joi.object({
  username: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  confirmpassword: Joi.string().valid(Joi.ref("password")).required(),
}).required();

//////activate account
export const activateAccount = Joi.object({
  token: Joi.string().required(),
}).required();
export const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).required();

export const forgetCode = Joi.object({
  email: Joi.string().email().required(),
}).required();

export const resetPassword = Joi.object({
  email: Joi.string().email().required(),
  forgetCode: Joi.string().length(5).required(),
  password: Joi.string().required(),
  confirmpassword: Joi.string().valid(Joi.ref("password")).required(),
}).required();
