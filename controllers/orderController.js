// libraries
import { StatusCodes } from "http-status-codes";

// mongoose models
import Order from "../models/Order.js";

// middlewares
import { asyncWrapper } from "../middlewares/asyncWrapper.js";

// custom errors
import { NotFound, BadRequest } from "../errors/index.js";

// stripe
import { stripe } from "../configs/stripe.js";

const createOrder = asyncWrapper(async (req, res) => {
  const { orderItems, paymentMethod } = req.body;

  const totalAmount = orderItems.reduce((acc, item) => {
    return (acc += item.price * item.quantity);
  }, 0);

  await Order.create({
    orderItems,
    totalAmount,
    paymentMethod,
    user: req.user.userID,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "order created",
  });
});

const createPaymentIntent = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { paymentMethod } = req.body;

  if (!paymentMethod) throw new BadRequest("payment method is required");

  const order = await Order.findOne({
    _id: id,
    user: req.user.userID,
  });
  if (!order) throw new NotFound("resource not found");

  if (order.status !== "pending") {
    throw new BadRequest("order is already paid");
  }

  if (paymentMethod === "cash") {
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "order set for cash on delivery",
    });
  }

  if (order.paymentIntentId) {
    const existingIntent = await stripe.paymentIntents.retrieve(
      order.paymentIntentId
    );
    return res.status(StatusCodes.OK).json({
      success: true,
      clientSecret: existingIntent.client_secret,
    });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: order.totalAmount * 100,
    currency: "gel",
    metadata: { orderId: order._id.toString() },
  });

  order.paymentIntentId = paymentIntent.id;
  await order.save();

  res.status(StatusCodes.CREATED).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});

const getAllOrders = asyncWrapper(async (req, res) => {
  const orders = await Order.find({})
    .sort("-createdAt")
    .populate("user", "username")
    .lean();

  res.status(StatusCodes.OK).json({
    success: true,
    totalOrders: orders.length,
    data: orders,
  });
});

const getMyOrders = asyncWrapper(async (req, res) => {
  const myOrders = await Order.find({ user: req.user.userID })
    .sort("-createdAt")
    .lean();

  res.status(StatusCodes.OK).json({
    success: true,
    totalOrders: myOrders.length,
    data: myOrders,
  });
});

const getSingleOrder = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id).lean();
  if (!order) throw new NotFound("resource not found");

  res.status(StatusCodes.OK).json({
    success: true,
    data: order,
  });
});

const payOrder = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) throw new NotFound("resource not found");

  if (order.status !== "pending") throw new BadRequest("order is already paid");

  order.status = "paid";
  order.paidAt = Date.now();
  await order.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "thank you for your purchase",
  });
});

const updateOrder = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findById(id);
  if (!order) throw new NotFound("resource not found");

  const statusFlow = {
    pending: ["paid", "cancelled"],
    paid: ["processing", "cancelled"],
    processsing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  if (!statusFlow[order.status].includes(status))
    throw new BadRequest(
      `cannot change order from ${order.status} to ${status}`
    );

  if (status === "processing") {
    order.status = "processing";
    order.processingAt = Date.now();
  }
  if (status === "shipped") {
    order.status = "shipped";
    order.shippedAt = Date.now();
  }
  if (status === "delivered") {
    order.status = "delivered";
    order.deliveredAt = Date.now();
  }
  if (status === "cancelled") {
    order.status = "cancelled";
    order.cancelledAt = Date.now();
  }

  order.status = status;
  await order.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "order updated successfully",
  });
});

const cancelOrder = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) throw new NotFound("resource not found");

  if (order.status === "cancelled")
    throw new BadRequest("order is already cancelled");
  if (order.status === "shipped")
    throw new BadRequest("order is on the way and can't be cancelled");
  if (order.status === "delivered")
    throw new BadRequest("order is already delivered and can't be cancelled");

  if (order.paymentMethod === "cash") {
    order.status = "cancelled";
    order.cancelledAt = Date.now();
    await order.save();
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "order cancelled successfully",
    });
  }

  if (order.paymentIntentId) {
    await stripe.refunds.create({
      payment_intent: order.paymentIntentId,
      reason: "requested_by_customer",
    });
  }

  order.status = "cancelled";
  order.cancelledAt = Date.now();
  order.paymentIntentId = undefined;
  await order.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "order cancelled successfully",
  });
});

export {
  createOrder,
  createPaymentIntent,
  getAllOrders,
  getMyOrders,
  getSingleOrder,
  payOrder,
  updateOrder,
  cancelOrder,
};
