import { Types } from "mongoose";

export const isValidObjectID = (value, helper) => {
  if (Types.ObjectId.isValid(value)) return true;
  return helper.message("invalid objecid !");
};

export const validation = (schema) => {
  return (req, res, next) => {
    const data = { ...req.body, ...req.params, ...req.query };

    const validationResult = schema.validate(data, { abortEarly: false });
    if (validationResult.error) {
      const errorMessages = validationResult.error.details.map(
        (errorobj) => errorobj.message
      );
      //console.log("Validation Error Messages:", errorMessages);
      return next(new Error(errorMessages.join(", "), 400));
    }
    return next();
  };
};
