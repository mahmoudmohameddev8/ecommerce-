import { asynchandler } from "../../utils/asynchandelrs.js";
import voucher_codes from "voucher-code-generator";
import { Coupon } from "../../../DB/models/coupon.model.js";

export const createCoupon = asynchandler(async (req, res, next) => {
  //genrate code
  const code = voucher_codes.generate({ length: 5 });

  //create code
  const coupon = await Coupon.create({
    name: code[0],
    createdBy: req.user._id,
    discount: req.body.discount,
    expiredAt: new Date(req.body.expiredAt).getTime(),
  });
  //response
  return res.json({ sucess: true, results: { coupon } });
});
export const updateCoupon = asynchandler(async (req, res, next) => {
  //check coupon
  const coupon = await Coupon.findOne({
    name: req.params.code,
    expiredAt: { $gt: Date.now() },
  });
  //check owner
  if (req.user._id.toString() !== coupon.createdBy.toString())
    return next(new Error("you are not authorized"));
  //update coupon
  coupon.discount = req.body.discount ? req.body.discount : coupon.discount;
  coupon.expiredAt = req.body.expiredAt
    ? new Date(req.body.expiredAt).getTime()
    : coupon.expiredAt;
  await coupon.save();
  //send response
  return res.json({ sucess: true, message: "coupon updated sucessfully" });
});
export const deleteCoupon = asynchandler(async (req, res, next) => {
  const coupon = await Coupon.findOne({ name: req.params.code });
  if (!coupon) return next(new Error("coupon not found"));

  //check owner
  if (req.user._id.toString() !== coupon.createdBy.toString())
    return next(new Error("you are not authorized"));
  //delete coupon
  await coupon.deleteOne();
  return res.json({ sucess: true, message: "coupon delted sucessfully" });
});
export const getCoupons = asynchandler(async (req, res, next) => {
  if (req.user.role === "admin") {
    const coupons = await Coupon.find();
    return res.json({ sucess: true, results: { coupons } });
  }
  if (req.user.role === "seller") {
    const coupons = await Coupon.find({ createdBy: req.user._id });
    return res.json({ sucess: true, results: { coupons } });
  }
});
