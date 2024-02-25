import { asynchandler } from "../../utils/asynchandelrs.js";
import cloudinary from "../../utils/cloud.js";
import { Category } from "../../../DB/models/category.model.js";
import slugify from "slugify";

export const createCategory = asynchandler(async (req, res, next) => {
  //name slug crated by image
  //check file
  if (!req.file)
    return next(new Error("category image is reqiured"), { cause: 400 });
  //upload image in couldinarey
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/category`,
    }
  );
  //save category in DB
  await Category.create({
    name: req.body.name,
    slug: slugify(req.body.name),
    image: { id: public_id, url: secure_url },
    createdBy: req.user._id,
  });
  return res.json({ sucess: true, message: "category created successfully" });
});

export const updateCategory = asynchandler(async (req, res, next) => {
  //check category in database
  const category = await Category.findById(req.params.id);
  if (!category) return next(new Error("category not found", { cause: 404 }));
  //check category owner
  if (req.user._id.toString() !== category.createdBy.toString())
    return next(new Error("you are not allwoed to update category"));
  //check file>>>upload in category
  if (req.file) {
    const { Public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      { Public_id: category.image.id }
    );
    category.image = { id: Public_id, url: secure_url };
  }
  //update category
  category.name = req.body.name ? req.body.name : category.name;
  category.slug = req.body.name ? slugify(req.body.name) : category.slug;

  await category.save();
  //return response
  return res.json({ sucess: true, message: "category upated suceesfully" });
});

export const deleteCategory = asynchandler(async (req, res, next) => {
  //check category
  const category = await Category.findById(req.params.id);
  if (!category) return next(new Error("category not found", { cause: 404 }));
  //check category owner
  if (req.user._id.toString() !== category.createdBy.toString())
    return next(new Error("you are not allwoed to delete category"));

  await Category.findByIdAndDelete(req.params.id);

  //delete image from  cloudinary
  await cloudinary.uploader.destroy(category.image.id);
  //return res
  return res.json({ sucess: true, message: "category deleted sucessfulyy" });
});
export const allCategories = asynchandler(async (req, res, next) => {
  const results = await Category.find().populate("Subcategory");
  console.log(results);
  return res.json({ sucess: true, results });
});
