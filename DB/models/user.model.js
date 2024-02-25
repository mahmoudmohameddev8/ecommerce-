import { Schema, model } from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    profileImg: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dspwqc144/image/upload/v1706967911/ecommerce%20app/users/defaults/profilePic/blank-profile-picture-973460_1280_kkn5qq.png",
      },
      id: {
        type: String,
        default:
          "ecommerce%20app/users/defaults/profilePic/blank-profile-picture-973460_1280_kkn5qq.",
      },
    },
    coverImg: {
      url: { type: String },
      id: { type: String },
    },
    forgetCode: String,
  },
  { timestamps: true }
);
userSchema.pre("save", async function () {
  if (this.isModified("password"))
    this.password = bcryptjs.hashSync(
      this.password,
      parseInt(process.env.SALT_ROUND)
    );
});
export const User = model("User", userSchema);
