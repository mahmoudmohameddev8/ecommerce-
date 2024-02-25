import { Token } from "../../DB/models/token.model.js";
import { asynchandler } from "../utils/asynchandelrs.js";
import { User } from "../../DB/models/user.model.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = asynchandler(async (req, res, next) => {
  //check token exitence
  let { token } = req.headers;
  //check barer key
  
  if (!token) {
    return next(new Error("valid token is required"));
  }
  if (!token.startsWith(process.env.BEARER_KEY)) {
    return next(new Error("valid token "));
  }

  //extract payload

  let newtoken = token.split(process.env.BEARER_KEY)[1];
  const payload = jwt.verify(newtoken, process.env.TOKEN_SECRET);
  //check token in db
  const tokenDB = await Token.findOne({ token:newtoken, isvalid: true });
  if (!tokenDB) return next(new Error("token is invalid"));
  //check user existence
  const user = await User.findById(payload.id);
  if (!user) return next(new Error("user not found", { cause: 404 }));
  //pass user
  req.user = user;
  //return next
  return next();
});
