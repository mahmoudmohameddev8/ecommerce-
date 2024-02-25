import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as productController from "./product.controller.js";
import { fileUpload } from "../../../src/utils/fileupload.js";
import * as productSchema from "./product.schema.js";
import reviewRouter from "./../review/review.router.js";

const router = Router();
router.use("/:productId/review", reviewRouter);

router.post(
  "/",
  isAuthenticated,
  isAuthorized("seller"),
  fileUpload().fields([{ name: "subImages", maxCount: 3 }]),
  validation(productSchema.createProduct),
  productController.createProduct
);

router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("seller"),
  validation(productSchema.deleteProduct),
  productController.deleteProduct
);
router.get("/", productController.allProducts);
export default router;
