import User from "../models/User.js";
import Order from "../models/Order.js";

export const deleteExpiredTokens = async () => {
  await User.updateMany(
    {
      resetPasswordExpire: { $lte: Date.now() },
    },
    {
      $unset: {
        resetPasswordExpire: "",
        resetPasswordToken: "",
      },
    }
  );
};

export const deleteExpiredVerifyEmailTokens = async () => {
  await User.updateMany(
    {
      verifyEmailExpire: { $lte: Date.now() },
    },
    {
      $unset: {
        verifyEmailExpire: "",
        verifyEmailToken: "",
      },
    }
  );
};

export const deletePendingOrders = async () => {
  await Order.deleteMany({ status: "pending" });
};
