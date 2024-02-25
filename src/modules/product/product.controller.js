import { nanoid } from "nanoid";
import { Brand } from "../../../DB/models/brand.model.js";
import { Category } from "../../../DB/models/category.model.js";
import { Subcategory } from "../../../DB/models/subcategory.model.js";
import { asynchandler } from "../../utils/asynchandelrs.js";
import cloudinary from "../../utils/cloud.js";
import { Product } from "../../../DB/models/product.model.js";

export const createProduct = asynchandler(async (req, res, next) => {
  //category
  const category = await Category.findById(req.body.category);
  if (!category) return next(new Error("Category not found!", { cause: 404 }));
  //subcategory
  const subcategory = await Subcategory.findById(req.body.subcategory);
  if (!subcategory)
    return next(new Error("subcategory not found!", { cause: 404 }));
  //brand
  const brand = await Brand.findById(req.body.brand);
  if (!brand) return next(new Error("brand not found!", { cause: 404 }));

  if (!req.files)
    return next(new Error("product images are required!", { cause: 400 }));
  // create unqiue folder name for each product
  const cloudFolder = nanoid();

  // req.files >>>  {}
  // upload subimages
  const images = [];
  for (const file of req.files.subImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/products/${cloudFolder}/`,
      }
    );
    images.push({ id: public_id, url: secure_url });
  }
  // create product

  const product = await Product.create({
    ...req.body,
    cloudFolder,
    createdBy: req.user._id,
    images,
  });

  // resposne
  return res.status(201).json({ success: true, results: { product } });
});

export const deleteProduct = asynchandler(async (req, res, next) => {
  // check product
  const product = await Product.findById(req.params.id);
  if (!product) return next(new Error("product not found", { cause: 404 }));

  // check owner
  if (product.createdBy.toString() != req.user.id)
    return next(new Error("Not Authorized!", { cause: 403 }));

  // delete product -- from database
  await product.deleteOne();

  //delete images -- from cloud
  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.CLOUD_FOLDER_NAME}/products/${product.cloudFolder}`
  );

  // delete folder
  await cloudinary.api.delete_folder(
    `${process.env.CLOUD_FOLDER_NAME}/products/${product.cloudFolder}`
  );

  // response
  return res.json({ success: true, message: "product deleted successfully!" });
});
export const allProducts = asynchandler(async (req, res, next) => {
  //search
  let { page, keyword, sort, brand, subcategory, category } = req.query;
  if (category && !(await Category.findById(req.query.category)))
    return next(new Error("category not found", { cause: 404 }));

  if (subcategory && !(await Subcategory.findById(req.query.subcategory)))
    return next(new Error("subcategory not found", { cause: 404 }));

  if (brand && !(await Brand.findById(req.query.brand)))
    return next(new Error("brand not found", { cause: 404 }));

  const results = await Product.find({ ...req.query })
    .paginate(page)
    .sort(sort)
    .search(keyword);
  return res.json({ sucess: true, results });
});
