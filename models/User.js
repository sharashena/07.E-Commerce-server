import mongoose from "mongoose";

// libraries
import validator from "validator";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

// cloudinary
import { cloudinary } from "../configs/cloudinary.js";

// custom errors
import { NotFound } from "../errors/index.js";

const userSchema = new mongoose.Schema(
  {
    avatar: {
      type: Object,
      default: {
        id: uuid(),
        src: "/public/assets/default-avatar.jpg",
      },
    },
    username: {
      type: String,
      minLength: [2, "username can't be less than 2 characters"],
      maxLength: [15, "username can't be more than 15 characters"],
      required: [true, "username is required"],
      unique: true,
    },
    email: {
      type: String,
      validate: {
        validator: value => validator.isEmail(value),
        message: "invalid email format",
      },
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [4, "password length can't be less than 4 characters"],
      maxLength: [15, "password length can't be more than 15 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "user"],
        message: "{VALUE} is not valid role",
      },
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verifyEmailToken: String,
    verifyEmailExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const genSalt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, genSalt);
});

userSchema.pre("deleteOne", { document: true }, async function () {
  const products = await mongoose.model("Product").find({ user: this._id });
  if (!products) throw new NotFound("resource not found");

  await cloudinary.uploader.destroy(this.avatar.id);

  for (const product of products) {
    for (const image of product.images) {
      if (image.id.startsWith("images/")) {
        await cloudinary.uploader.destroy(image.id);
      }
    }
  }

  await mongoose.model("Product").deleteMany({ user: this._id });
  await mongoose.model("Review").deleteMany({ user: this._id });
});

export default mongoose.model("User", userSchema);
