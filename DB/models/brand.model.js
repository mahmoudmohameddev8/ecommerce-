import { Schema, Types, model } from "mongoose";

const brandSchema = new Schema(
  {
    name: { type: String, unique: true, required: true, min: 2, max: 12 },
    slug: { type: String, unique: true },
    image: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    createdBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
/* brandSchema.virtual("Subcategory", {
  ref: "Subcategory",
  localField: "_id",
  foreignField: "brand",
});
brandSchema.virtual("category", {
  ref: "category",
  localField: "_id",
  foreignField: "brand",
}); */

export const Brand = model("Brand", brandSchema);
