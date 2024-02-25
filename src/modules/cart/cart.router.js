import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as cartController from "./cart.controller.js";
import * as cartSchema from "./cart.schema.js";

const router = Router();

router.post(
  "/",
  isAuthenticated,
  isAuthorized("user"),
  validation(cartSchema.addToCart),
  cartController.addToCart
);
router.get(
  "/",
  isAuthenticated,
  isAuthorized("admin", "user"),
  validation(cartSchema.getCart),
  cartController.getCart
);
router.patch(
  "/",
  isAuthenticated,
  isAuthorized("user"),
  validation(cartSchema.updateCart),
  cartController.updateCart
);
// remove from cart
router.patch(
  "/:productId",
  isAuthenticated,
  isAuthorized("user"),
  validation(cartSchema.removeFromCart),
  cartController.removeFromCart
);
// clear cart
router.put(
  "/clear",
  isAuthenticated,
  isAuthorized("user"),
  cartController.clearCart
);
export default router;
