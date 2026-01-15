// libraries
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import crypto from "crypto";

// mongoose models
import User from "../models/User.js";

// middlewares
import { asyncWrapper } from "../middlewares/asyncWrapper.js";

// custom errors
import { BadRequest, NotFound } from "../errors/index.js";

// utils
import { attachCookiesToResponse } from "../utils/attachCookiesToResponse.js";
import { sendEmail } from "../utils/sendEmail.js";

// templates
import { resetPasswordContext } from "../templates/resetPasswordContext.js";
import { forgotEmailContext } from "../templates/forgotEmailContext.js";

const registerUser = asyncWrapper(async (req, res) => {
  const firstUser = (await User.countDocuments({})) === 0;

  const role = firstUser ? "admin" : "user";

  await User.create({ ...req.body, role });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "user created",
  });
});

const loginUser = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password").lean();
  if (!user) throw new NotFound("invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new BadRequest("invalid credentials");

  attachCookiesToResponse({ res, user });

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Hi, ${user.username}`,
  });
});

const forgotPassword = asyncWrapper(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "if email exists, link will be send to the email",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 1000 * 60 * 15;
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = expiresAt;

  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: "Recover Your Email",
    html: resetPasswordContext(resetUrl),
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "if email exists, link will be send to the email",
  });
});

const resetPassword = asyncWrapper(async (req, res) => {
  const { token } = req.query;
  const { newPassword, confirmPassword } = req.body;

  if (!token) throw new NotFound("token is missing");

  if (newPassword !== confirmPassword) {
    throw new BadRequest("passwords doesn't match");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gte: Date.now() },
  });

  if (!user) throw new BadRequest("invalid or expired token");

  user.password = newPassword;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "password successfully changed",
  });
});

const forgotEmail = asyncWrapper(async (req, res) => {
  const { username } = req.body;

  const user = await User.findOne({ username }).lean();
  if (!user) {
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "if username exists, link will be send to the email",
    });
  }

  await sendEmail({
    to: user.email,
    subject: "Recover your email",
    html: forgotEmailContext(user.email),
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "if username exists, link will be send to the email",
  });
});

export { registerUser, loginUser, forgotEmail, forgotPassword, resetPassword };
