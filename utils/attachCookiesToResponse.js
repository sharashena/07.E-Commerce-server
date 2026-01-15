import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const jwtSecret = process.env.JWT_SECRET;

const createJWT = data =>
  jwt.sign(data, jwtSecret, {
    expiresIn: "1d",
  });

const verifyJWT = token => jwt.verify(token, jwtSecret);

const attachCookiesToResponse = ({ res, user }) => {
  const token = createJWT({
    userID: user._id,
    username: user.username,
    role: user.role,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24,
  });
};

export { attachCookiesToResponse, verifyJWT };
