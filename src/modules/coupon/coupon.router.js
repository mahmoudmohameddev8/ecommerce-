import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as couponSchema from "./coupon.schema.js";
import * as couponcontroller from "./coupon.controller.js";

const router = Router();
//create coupon
router.post(
  "/",
  isAuthenticated,
  isAuthorized("seller"),
  validation(couponSchema.createCoupon),
  couponcontroller.createCoupon
);
router.patch(
  "/:code",
  isAuthenticated,
  isAuthorized("seller"),
  validation(couponSchema.updateCoupon),
  couponcontroller.updateCoupon
);
router.delete(
  "/:code",
  isAuthenticated,
  isAuthorized("seller"),
  validation(couponSchema.deleteCoupon),
  couponcontroller.deleteCoupon
);
router.get(
  "/",
  isAuthenticated,
  isAuthorized("admin", "seller"),
  couponcontroller.getCoupons
);
export default router;
