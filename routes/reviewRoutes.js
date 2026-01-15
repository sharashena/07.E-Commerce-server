import express from "express";

// middlewares
import {
  authMiddleware,
  authorizePermission,
} from "../middlewares/authMiddleware.js";

// joi imports
import { validate } from "../middlewares/validate.js";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../validations/reviewValidation.js";

// controllers
import {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router
  .route("/")
  .post([authMiddleware, validate(createReviewSchema)], createReview)
  .get(getAllReviews);
router
  .route("/:id")
  .get([authMiddleware, authorizePermission("admin")], getSingleReview)
  .patch([authMiddleware, validate(updateReviewSchema)], updateReview)
  .delete([authMiddleware, deleteReview]);

export default router;
