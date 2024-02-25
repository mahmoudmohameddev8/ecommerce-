import { asynchandler } from "../../utils/asynchandelrs.js";
import { Coupon } from "./../../../DB/models/coupon.model.js";
import { Cart } from "./../../../DB/models/cart.model.js";
import { Product } from "./../../../DB/models/product.model.js";
import { Order } from "../../../DB/models/order.model.js";
import createInvoice from "./../../utils/createInvoice.js";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "./../../utils/cloud.js";
import { sendEmail } from "./../../utils/sendEmails.js";
import { clearCart, updateStock } from "./order.services.js";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const createOrder = asynchandler(async (req, res, next) => {
  // data
  const { payment, address, phone, coupon } = req.body;
  // check coupon
  let checkCoupon;
  if (coupon) {
    checkCoupon = await Coupon.findOne({
      name: coupon,
      expiredAt: { $gt: Date.now() },
    });
  }
  //if (!checkCoupon) return next(new Error("Invalid coupon!"));
  // get products from cart
  const cart = await Cart.findOne({ user: req.user._id });
  const products = cart.products;
  // check product
  if (products.length < 1) return next(new Error("Empty Cart!"));
  let orderProducts = [];
  let orderPrice = 0;

  for (let i = 0; i < products.length; i++) {
    const product = await Product.findById(products[i].productId);
    if (!product) return next(new Error("Invalid product!", { cause: 404 }));

    if (!product.inStock(products[i].quantity))
      return next(
        new Error(`only ${product.avaliableItems} items are left in stock!`)
      );

    orderProducts.push({
      productId: product._id,
      quantity: products[i].quantity,
      name: product.name,
      itemPrice: product.finalPrice,
      totalPrice: product.finalPrice * products[i].quantity,
    });

    orderPrice += product.finalPrice * products[i].quantity;
  }

  // convert to order - create order in db
  const order = await Order.create({
    user: req.user._id,

    address,
    phone,
    payment,
    coupon: {
      id: checkCoupon?._id,
      name: checkCoupon?.name,
      discount: checkCoupon?.discount,
    },
    products: orderProducts,
    price: orderPrice,
  });

  // create invoice
  const user = req.user;
  const invoice = {
    shipping: {
      name: user.userName,
      address: order.address,
      country: "Egypt",
    },
    items: order.products,
    subtotal: order.price,
    paid: order.finalPrice,
    invoice_nr: order._id,
  };

  const pdfPath = path.join(__dirname, `./../../tempInvoices/${order._id}.pdf`);
  createInvoice(invoice, pdfPath);
  // upload in cloud
  const { secure_url, public_id } = await cloudinary.uploader.upload(pdfPath, {
    folder: `${process.env.CLOUD_FOLDER_NAME}/users/${user._id}/orders/invoices`,
  });
  // update order
  order.invoice = { url: secure_url, id: public_id };
  await order.save();
  // send email to user
  const isSent = await sendEmail({
    to: user.email,
    subject: "Order confirmation",
    attachments: [
      {
        path: secure_url,
        contentType: "application/pdf",
      },
    ],
  });
  //  check email
  if (!isSent) return next(new Error("Something went wrong!"));

  // update stock
  updateStock(order.products, true);

  // clear cart
  clearCart(user._id);

  //visa payment
  if (payment == "visa") {
    // stripe
    const stripe = new Stripe(process.env.STRIPE_KEY);

    // coupon >> stripe
    let couponExisted;
    if (order.coupon.name !== undefined) {
      couponExisted = await stripe.coupons.create({
        percent_off: order.coupon.discount,
        duration: "once",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: {
              name: product.name,
              // images: [product.productId.defaultImage.url],
            },
            unit_amount: product.itemPrice * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: couponExisted ? [{ coupon: couponExisted.id }] : [],
    });

    return res.json({ success: true, results: session.url });
  }
  // response
  return res.json({ sucess: true });
});

export const cancelOrder = asynchandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new Error("order not found!"));

  if (order.status !== "placed")
    return next(new Error("Can not cancel order now!"));

  order.status = "canceled";
  await order.save();

  // update stock
  updateStock(order.products, false);

  return res.json({ success: true, message: "order cancelled successfully!" });
});
