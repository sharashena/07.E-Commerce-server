import express from "express";

// middlewares
import {
  authMiddleware,
  authorizePermission,
} from "../middlewares/authMiddleware.js";

// controllers
import {
  createOrder,
  createPaymentIntent,
  getAllOrders,
  getMyOrders,
  getSingleOrder,
  payOrder,
  updateOrder,
  cancelOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router
  .route("/")
  .post(authMiddleware, createOrder)
  .get([authMiddleware, authorizePermission("admin")], getAllOrders);
router.get("/my", authMiddleware, getMyOrders);
router.post("/:id/payment-intent", authMiddleware, createPaymentIntent);
router.post("/:id/pay", authMiddleware, payOrder);
router.post("/:id/cancel", authMiddleware, cancelOrder);
router
  .route("/:id")
  .get([authMiddleware, authorizePermission("admin")], getSingleOrder)
  .patch([authMiddleware, authorizePermission("admin")], updateOrder);

export default router;
