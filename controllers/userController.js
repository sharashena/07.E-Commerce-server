// node
import crypto from "crypto";

// libraries
import { StatusCodes } from "http-status-codes";
import { v4 as uuid } from "uuid";

// mongoose models
import User from "../models/User.js";

// middlewares
import { asyncWrapper } from "../middlewares/asyncWrapper.js";

// custom errors
import { NotFound } from "../errors/index.js";

// utils
import { sendEmail } from "../utils/sendEmail.js";
import { uploadAvatarsToCloudinary } from "../utils/uploadToCloudinary.js";

// templates
import { verifiyEmailContext } from "../templates/verifyEmailContext.js";
import { cloudinary } from "../configs/cloudinary.js";

const getAllUsers = asyncWrapper(async (req, res) => {
  const users = await User.find({}).sort("-createdAt").lean();

  res.status(StatusCodes.OK).json({
    success: true,
    totalUsers: users.length,
    data: users,
  });
});

const getCurrentUser = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user.userID).lean();
  if (!user) throw new NotFound("resource not found");

  res.status(StatusCodes.OK).json({
    success: true,
    data: user,
  });
});

const getSingleUser = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).lean();
  if (!user) throw new NotFound("resource not found");

  res.status(StatusCodes.OK).json({
    success: true,
    data: user,
  });
});

const sendVerifyEmail = asyncWrapper(async (req, res) => {
  const userId = req.user.userID;

  const user = await User.findById(userId);
  if (!user) throw new NotFound("resource not found");

  const verifyToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");
  const expiresAt = Date.now() + 1000 * 60 * 15;

  user.verifyEmailToken = hashedToken;
  user.verifyEmailExpire = expiresAt;
  await user.save();

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

  await sendEmail({
    to: user.email,
    subject: "Verify Your Email",
    html: verifiyEmailContext(verifyUrl),
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "verification link has been sent to your email",
  });
});

const verifyEmail = asyncWrapper(async (req, res) => {
  const { token } = req.query;

  if (!token) throw new NotFound("token is missing");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    verifyEmailToken: hashedToken,
    verifyEmailExpire: { $gte: Date.now() },
  });
  if (!user) throw new NotFound("invalid or expired token");

  user.isVerified = true;
  user.verifiedAt = Date.now();
  user.verifyEmailExpire = undefined;
  user.verifyEmailToken = undefined;
  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "email is verified",
  });
});

const updateUser = asyncWrapper(async (req, res) => {
  const { username, email, removedImageId = "" } = req.body;

  const user = await User.findById(req.user.userID);
  if (!user) throw new NotFound("resource not found");

  const now = Date.now();
  const latestUpdate = user.updatedAt;
  const diff = now - new Date(latestUpdate).getTime();
  const day = 1000 * 60 * 60 * 24;

  // if (diff < day) {
  //   return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
  //     success: false,
  //     message: "you will be able to change your data in 30 days",
  //   });
  // }

  let hasChanged = false;

  if (username && username !== user.username) {
    user.username = username;
    hasChanged = true;
  }

  if (email && email !== user.email) {
    user.email = email;
    user.isVerified = false;
    user.verifiedAt = undefined;
    hasChanged = true;
  }

  if (req.file) {
    if (user.avatar.id.startsWith("avatars/")) {
      await cloudinary.uploader.destroy(user.avatar.id);
    }

    const result = await uploadAvatarsToCloudinary(req.file);
    user.avatar = {
      id: result.public_id,
      src: result.secure_url,
    };
    hasChanged = true;
  }

  if (removedImageId && removedImageId === user.avatar.id) {
    await cloudinary.uploader.destroy(user.avatar.id);
    user.avatar = {
      id: uuid(),
      src: "/public/assets/default-avatar.jpg",
    };
    hasChanged = true;
  }

  if (!hasChanged) {
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "no changes detected",
    });
  }

  await user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "user updated successfully",
  });
});

const deleteUser = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  let user = await User.findById(id);
  if (!user) throw new NotFound("resource not found");

  await user.deleteOne();

  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "user successfully deleted",
  });
});

const logoutUser = asyncWrapper(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "logged out successfully",
  });
});

export {
  getAllUsers,
  getCurrentUser,
  getSingleUser,
  updateUser,
  deleteUser,
  verifyEmail,
  sendVerifyEmail,
  logoutUser,
};
