import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: [0, "rating can't be less than 0"],
      max: [5, "rating can't be more than 5"],
      required: [true, "rating is required"],
    },
    comment: {
      type: String,
      maxLength: [500, "comment can't be more than 500 characters"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user id is required"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "product id is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
