import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload } from "../../utils/fileupload.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as brandcontroller from "./brand.controller.js";
import * as brandSchema from "./brand.schema.js";
const router = Router();

router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload().single("brand"),
  validation(brandSchema.createBrand),
  brandcontroller.createBrand
);
router.patch(
  "/:id",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload().single("brand"),
  validation(brandSchema.updateBrand),
  brandcontroller.updateBrand
);
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("admin"),

  validation(brandSchema.deleteBrand),
  brandcontroller.deleteBrand
);
router.get("/", brandcontroller.getAllBrands);
export default router;
