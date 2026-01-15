import mongoose from "mongoose";

const orderItems = {
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
    required: true,
  },
};

const orderSchema = new mongoose.Schema(
  {
    orderItems: {
      type: [orderItems],
      required: true,
      validate: {
        validator: v => v.length > 0,
        message: "order must have at least one item",
      },
    },
    status: {
      type: String,
      enum: {
        values: [
          "pending",
          "paid",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },
    totalAmount: {
      type: Number,
      required: [true, "total amount is required"],
      min: 0,
    },
    paymentIntentId: String,
    paidAt: Date,
    processingAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user id is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
