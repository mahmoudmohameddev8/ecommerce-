import { Cart } from "../../../DB/models/cart.model.js";
import { asynchandler } from "../../utils/asynchandelrs.js";
import { Product } from "../../../DB/models/product.model.js";

export const addToCart = asynchandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  // check product
  const product = await Product.findById(productId);
  if (!product) return next(new Error("Product not found!", { cause: 404 }));

  // check stock
  if (!product.inStock(quantity))
    return next(
      new Error(
        `Sorry, only ${product.avaliableItems} items are available in the stock!`
      )
    );
  // check product in cart
  const isProductInCart = await Cart.findOne({
    user: req.user._id,
    "products.productId": productId,
  });

  if (isProductInCart) {
    const theProduct = isProductInCart.products.find(
      (prd) => prd.productId.toString() === productId.toString()
    );

    // check stock
    if (product.inStock(theProduct.quantity + quantity)) {
      theProduct.quantity = theProduct.quantity + quantity;
      await isProductInCart.save();
      return res.json({ sucess: true, results: { cart: isProductInCart } });
    } else {
      return next(
        new Error(
          `Sorry, only ${product.avaliableItems} items are available in the stock!`
        )
      );
    }
  }

  const cart = await Cart.findOneAndUpdate(
    {
      user: req.user._id,
    },
    {
      $push: { products: { productId, quantity } },
    },
    { new: true }
  );
  return res.json({ sucess: true, results: { cart } });
});
export const getCart = asynchandler(async (req, res, next) => {
  if (req.user.role == "user") {
    const cart = await Cart.findOne({ user: req.user._id });
    return res.json({ sucess: true, results: { cart } });
  }
  if (req.user.role == "admin" || !req.body.cartID)
    return next(new Error("cart id is required"));

  const cart = await Cart.findOne(req.body.cartID);
  return res.json({ sucess: true, results: { cart } });
});
export const updateCart = asynchandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  // check product
  const product = await Product.findById(productId);
  if (!product) return next(new Error("Product not found!", { cause: 404 }));

  // check stock
  if (!product.inStock(quantity))
    return next(
      new Error(
        `Sorry, only ${product.avaliableItems} items are available in the stock!`
      )
    );

  const results = await Cart.findOneAndUpdate(
    {
      user: req.user._id,
      "products.productId": productId,
    },
    { "products.$.quantity": quantity },
    { new: true }
  );
  return res.json({ sucess: true, result: { results } });
});
export const removeFromCart = asynchandler(async (req, res, next) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);

  if (!product) return next(new Error("Invalid product!"));

  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id, "products.productId": productId },
    { $pull: { products: { productId } } },
    { new: true }
  );

  if (!cart) return next(new Error("product not found!"));

  return res.json({ success: true, results: { cart } });
});
export const clearCart = asynchandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { products: [] },
    { new: true }
  );
  return res.json({ success: true, results: { cart } });
});
