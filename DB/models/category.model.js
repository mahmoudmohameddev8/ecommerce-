import { Schema, Types, model } from "mongoose";
import { Subcategory } from "./subcategory.model.js";

const categorySchema = new Schema(
  {
    name: { type: String, unique: true, required: true, min: 5, max: 20 },
    slug: { type: String, unique: true, required: true },
    createdBy: { type: Types.ObjectId, ref: "user", required: true },
    image: { id: { type: String }, url: { type: String } },
    brands: { type: Types.ObjectId, ref: "Brand" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
categorySchema.virtual("Subcategory", {
  ref: "Subcategory",
  localField: "_id",
  foreignField: "category",
});
categorySchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await Subcategory.deleteMany({ category: this._id });
  }
);
export const Category = model("Category", categorySchema);
