import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "product name is required"],
      minLength: [2, "product name can't be less than 2 characters"],
      maxLength: [20, "product name can't be more than 20 characters"],
    },
    category: {
      type: String,
      required: [true, "product category is required"],
      enum: {
        values: [
          "living room",
          "kitchen",
          "office,",
          "kids",
          "dining",
          "bedroom",
        ],
        message: "{VALUE} is not a valid category",
      },
    },
    company: {
      type: String,
      required: [true, "product company is required"],
      enum: {
        values: ["ikea", "marcos", "liddy", "caressa"],
        message: "{VALUE} is not a valid company",
      },
    },
    price: {
      type: Number,
      min: [0, "product price can't be less than 0"],
    },
    description: {
      type: String,
      maxLength: [500, "product description can't be more than 500 characters"],
    },
    colors: {
      type: [String],
      required: [true, "choose at least one color"],
      validate: {
        validator: function (values) {
          return (
            values.length > 0 &&
            values.every(v => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v))
          );
        },
        message: "each color must be a valid hex color",
      },
      lowercase: true,
    },
    images: {
      type: [Object],
      default: [
        {
          id: uuid(),
          width: 400,
          height: 200,
          resource_type: "image",
          src: "/public/assets/default.jpg",
        },
      ],
    },
    vip: {
      type: Boolean,
      default: false,
    },
    shipping: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      required: [true, "product stock is required"],
      min: [0, "product stock can't be less than 0"],
    },
    avgRating: {
      type: Number,
      min: [0, "product rating can't be less than 0"],
      max: [5, "product rating can't be more than 5"],
      default: 0,
    },
    numOfComments: {
      type: Number,
      min: [0, "product comments can't be less than 0"],
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user id is required"],
    },
  },
  { timestamps: true }
);

productSchema.pre("deleteOne", { document: true }, async function () {
  await mongoose.model("Review").deleteMany({ product: this._id });
});

export default mongoose.model("Product", productSchema);
