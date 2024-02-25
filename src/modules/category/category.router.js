import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as categoryController from "./category.controller.js";
import * as categorySchema from "./category.schema.js";
import { fileUpload } from "../../../src/utils/fileupload.js";
import subcategoryRouter from "../subcategory/subcategory.router.js";
const router = Router();

router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload().single("category"),
  validation(categorySchema.createCategory),
  categoryController.createCategory
);
router.patch(
  "/:id",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload().single("category"),
  validation(categorySchema.updateCategory),
  categoryController.updateCategory
);
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("admin"),
  validation(categorySchema.deleteCategory),
  categoryController.deleteCategory
);
router.get("/", categoryController.allCategories);

router.use("/:category/subcategory", subcategoryRouter);
export default router;
