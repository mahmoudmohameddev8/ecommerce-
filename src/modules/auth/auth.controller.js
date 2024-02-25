import jwt from "jsonwebtoken";
import { User } from "../../../DB/models/user.model.js";
import { asynchandler } from "../../utils/asynchandelrs.js";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../../utils/sendEmails.js";
import { resetPassTemp, signUpTemp } from "../../utils/htmlTemplates.js";
import { Token } from "./../../../DB/models/token.model.js";
import Randomstring from "randomstring";
import { Cart } from "../../../DB/models/cart.model.js";

export const register = asynchandler(async (req, res, next) => {
  ////data from user
  const { email, username, password } = req.body;
  ////chek user existence
  const user = await User.findOne({ email });
  if (user) return next(new Error("user already existed", { cause: 409 }));

  /////generate token
  const token = jwt.sign({ email }, process.env.TOKEN_SECRET);

  /////create user
  await User.create({ email, username, password });
  ///////create confirmationlink
  const confirmationLink = `http://localhost:3000/auth/activate/${token}`;
  /////sendemail
  const messageSent = await sendEmail({
    to: email,
    subject: "activate account",
    html: signUpTemp(confirmationLink),
  });
  if (!messageSent) return next(new Error("something went wrong"));
  ////send response
  return res.json({ sucess: true, message: "ceheck your email!  " });
});

//////activate account
export const activateAccount = asynchandler(async (req, res, next) => {
  const { token } = req.params;
  const { email } = jwt.verify(token, process.env.TOKEN_SECRET);

  /////find user and update is confirmed
  const user = await User.findOneAndUpdate({ email }, { isConfirmed: true });

  //////check if user dosenot exit
  if (!user) return next(new Error("user not found", { cause: 404 }));

  ////create card//TODO
  await Cart.create({ user: user._id });
  ////send response
  return res.json({ sucess: true, message: "you can login" });
});
export const login = asynchandler(async (req, res, next) => {
  const { email, password } = req.body;

  ///check user existence
  const user = await User.findOne({ email });
  if (!user) return next(new Error("invalid Email!", { cause: 404 }));

  ///check is confirmed
  if (!user.isConfirmed) return next(new Error("please activate your account"));
  ///check password
  const match = bcryptjs.compareSync(password, user.password);
  if (!match) return next(new Error("password not match"));
  ///generate token
  const token = jwt.sign({ email, id: user._id }, process.env.TOKEN_SECRET);

  ///save token in model
  await Token.create({ token, user: user._id });
  ///send response
  return res.json({ sucess: true, token });
});
//////forgetCode
export const forgetCode = asynchandler(async (req, res, next) => {
  ///data from body
  const { email } = req.body;
  ///check user
  const user = await User.findOne({ email });
  if (!user) return next(new Error("invalid Email!", { cause: 404 }));

  ///genreate forget code
  const forgetCode = Randomstring.generate({
    charset: "numeric",
    length: 5,
  });
  ///save forget code to usr
  user.forgetCode = forgetCode;
  await user.save();
  ///send email
  const messageSent = await sendEmail({
    to: email,
    subject: "Reset password",
    html: resetPassTemp(forgetCode),
  });
  if (!messageSent) return next(new Error("something went wrong"));
  ///send response
  return res.json({ sucess: true, message: "check your email" });
});
export const resetPassword = asynchandler(async (req, res, next) => {
  //data from requsest
  const { email, forgetCode, password } = req.body;
  //check user
  const user = await User.findOne({ email });
  if (!user) return next(new Error("invalid Email!", { cause: 404 }));

  //check forget code
  if (forgetCode !== user.forgetCode)
    return next(new Error("forge code is invalid!"));
  //hash password and save
  user.password = bcryptjs.hashSync(password, parseInt(process.env.SALT_ROUND));
  await user.save();
  // find all token of user
  const tokens = await Token.find({ user: user._id });
  //invalidate all tokens
  tokens.forEach(async (token) => {
    tokens.isvalid = false;
    await token.save();
  });
  //send response//redirect to login page //fronted
  return res.json({ sucess: true, message: "try to login again" });
});
