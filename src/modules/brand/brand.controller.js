import slugify from "slugify";
import { Category } from "../../../DB/models/category.model.js";
import { asynchandler } from "../../utils/asynchandelrs.js";
import cloudinary from "../../utils/cloud.js";
import { Brand } from "./../../../DB/models/brand.model.js";
import { Subcategory } from "../../../DB/models/subcategory.model.js";
export const createBrand = asynchandler(async (req, res, next) => {
  const { categories, subcategories, name } = req.body;
  categories.forEach(async (categoryId) => {
    //check category
    const category = await Category.findById(categoryId);
    if (!category) return next(new Error("category not found", { cause: 404 }));
  });
  //check subcategory
  subcategories.forEach(async (subcategoryId) => {
    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory)
      return next(new Error("subcategory not found", { cause: 404 }));
  });
  //check file
  if (!req.file) return next(new Error("iamge is reqiuerd"), { cause: 400 });
  //upload in cloudinary
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.CLOUD_FOLDER_NAME}/brands` }
  );
  //create brand
  const brand = await Brand.create({
    name,
    slug: slugify(name),
    createdBy: req.user._id,
    image: { id: public_id, url: secure_url },
  });
  //save in category
  categories.forEach(async (categoryId) => {
    await Category.findByIdAndUpdate(categoryId, {
      $push: { brands: brand._id },
    });
  });
  //save in sub category
  subcategories.forEach(async (subcategoryId) => {
    await Subcategory.findByIdAndUpdate(subcategoryId, {
      $push: { brands: brand._id },
    });
  });
  return res.json({ sucess: true, message: "brand created suceesfully" });
});
export const updateBrand = asynchandler(async (req, res, next) => {
  //check brand
  const brand = await Brand.findById(req.params.id);
  if (!brand) return next(new Error("brand not found", { cause: 404 }));
  //update photo
  if (req.file) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: brand.image.id,
      }
    );
    brand.image = { url: secure_url, id: public_id };
  }
  //update brand and save
  brand.name = req.body.name ? req.body.name : brand.name;
  brand.slug = req.body.name ? slugify(req.body.name) : brand.slug;
  await brand.save();
  return res.json({ sucess: true, message: "brand updated sucessfully" });
});
export const deleteBrand = asynchandler(async (req, res, next) => {
  //check brand and delete
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) return next(new Error("brand not found", { cause: 404 }));
  //delete brand in category
  await Category.updateMany({}, { $pull: { brands: req.params.id } });
  //deletbrand in sub category
  await Subcategory.updateMany({}, { $pull: { brands: req.params.id } });
  //destory photo
  cloudinary.uploader.destroy(brand.image.id);
  //return response
  return res.json({ sucess: true, message: "brand delted sucessfully" });
});
export const getAllBrands = asynchandler(async (req, res, next) => {
  const results = await Brand.find();
  return res.json({ sucess: true, results });
});
