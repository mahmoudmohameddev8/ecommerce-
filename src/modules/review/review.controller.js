import { asynchandler } from "../../utils/asynchandelrs.js";

import { Order } from "./../../../DB/models/order.model.js";
import { Review } from "./../../../DB/models/review.model.js";
import { Product } from "./../../../DB/models/product.model.js";

export const addReview = asynchandler(async (req, res, next) => {
  // data
  const { productId } = req.params;
  const { comment, rating } = req.body;
  // check product in order
  const order = await Order.findOne({
    user: req.user._id,
    "products.productId": productId,
    status: "delivered",
  });

  if (!order)
    return next(new Error("Can not review this product!", { cause: 400 }));

  // check past reviews
  if (
    await Review.findOne({
      createdBy: req.user._id,
      productId,
      orderId: order._id,
    })
  )
    return next(new Error("Already reviewd by you!"));

  // create review
  const review = await Review.create({
    createdBy: req.user._id,
    rating,
    comment,
    productId,
    orderId: order._id,
  });

  // calculate averageRate
  const reviews = await Review.find({ productId });
  const product = await Product.findById(productId);

  let calcRating = 0;
  for (let i = 0; i < reviews.length; i++) {
    calcRating += reviews[i].rating;
  }

  product.averageRate = calcRating / reviews.length;
  await product.save();

  // response
  return res.status(201).json({ success: true, results: { review } });
});
