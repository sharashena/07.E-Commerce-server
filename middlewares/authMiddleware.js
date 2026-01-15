// custom errors
import { Unauthorized } from "../errors/index.js";

// utils
import { verifyJWT } from "../utils/attachCookiesToResponse.js";

export const authMiddleware = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) throw new Unauthorized("unauthorized user");

  const user = verifyJWT(token);
  if (!user) throw new Unauthorized("unauthorized user");

  req.user = user;
  next();
};

export const authorizePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new Unauthorized("access is denied");
    }
    next();
  };
};
