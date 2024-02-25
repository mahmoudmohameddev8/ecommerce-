import { asynchandler } from "../../utils/asynchandelrs.js";
import cloudinary from "../../utils/cloud.js";
import { Category } from "../../../DB/models/category.model.js";
import { Subcategory } from "../../../DB/models/subcategory.model.js";
import slugify from "slugify";

export const createSubcategory = asynchandler(async (req, res, next) => {
  //name slug crated by image
  const category = await Category.findById(req.params.category);
  if (!category) return next(new Error("category not found", { cause: 404 }));
  //check file
  if (!req.file)
    return next(new Error("subcategory image is reqiured"), { cause: 400 });
  //upload image in couldinarey
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/subcategory`,
    }
  );
  //save category in DB
  await Subcategory.create({
    name: req.body.name,
    slug: slugify(req.body.name),
    image: { id: public_id, url: secure_url },
    createdBy: req.user._id,
    category: req.params.category,
  });
  return res.json({
    sucess: true,
    message: "subcategory created successfully",
  });
});

export const updateSubcategory = asynchandler(async (req, res, next) => {
  //check category in database
  const category = await Category.findById(req.params.category);
  if (!category) return next(new Error("category not found", { cause: 404 }));
  // check subcategory in database
  const subcategory = await Subcategory.findOne({
    _id: req.params.id,
    category: req.params.category,
  });
  if (!subcategory)
    return next(new Error("subcategory not found", { cause: 404 }));

  //check subcategory owner
  if (req.user._id.toString() !== category.createdBy.toString())
    return next(new Error("you are not allwoed to update subcategory"));
  //check file>>>upload in subcategory
  if (req.file) {
    const { Public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      { Public_id: subcategory.image._id }
    );
    subcategory.image = { id: Public_id, url: secure_url };
  }
  //update subcategory
  subcategory.name = req.body.name ? req.body.name : subcategory.name;
  subcategory.slug = req.body.name ? slugify(req.body.name) : subcategory.slug;

  await subcategory.save();
  //return response
  return res.json({ sucess: true, message: "subcategory upated suceesfully" });
});
export const deleteSubcategory = asynchandler(async (req, res, next) => {
  //check category
  const category = await Category.findById(req.params.category);
  if (!category) return next(new Error("category not found", { cause: 404 }));
  // check subcategory in database
  const subcategory = await Subcategory.findOne({
    _id: req.params.id,
    category: req.params.category,
  });
  if (!subcategory)
    return next(new Error("subcategory not found", { cause: 404 }));

  //check subcategory owner
  if (req.user._id.toString() !== subcategory.createdBy.toString())
    return next(new Error("you are not allwoed to delete category"));

  await Subcategory.findByIdAndDelete(req.params.id);

  //delete image from  cloudinary
  await cloudinary.uploader.destroy(subcategory.image.id);
  console.log(subcategory.image.id);
  //return res
  return res.json({ sucess: true, message: "subcategory deleted sucessfulyy" });
});
export const allSubcategories = asynchandler(async (req, res, next) => {
  if (req.params.category) {
    const result = await Subcategory.find({ category: req.params.category });
    return res.json({ success: true, result });
  }
  const results = await Subcategory.find().populate([
    { path: "category", select: "name-_id" },
  ]);
  return res.json({ sucess: true, results });
});
