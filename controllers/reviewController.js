// libraries
import { StatusCodes } from "http-status-codes";

// DB
import mongoose from "mongoose";

// mongoose models
import User from "../models/User.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";

// middlewares
import { asyncWrapper } from "../middlewares/asyncWrapper.js";

// custom errors
import { NotFound, Conflict, BadRequest } from "../errors/index.js";

const createReview = asyncWrapper(async (req, res) => {
  const { userID } = req.user;
  const { product: productID, rating, comment } = req.body;

  const user = await User.findById(userID).lean();
  if (!user) throw new NotFound("resource not found");

  const product = await Product.findById(productID).lean();
  if (!product) throw new NotFound("resource not found");

  const alreadyCommented = await Review.findOne({
    user: userID,
    product: productID,
  });

  if (alreadyCommented)
    throw new Conflict("you have already commented on this product");

  await Review.create({
    rating,
    comment,
    user: userID,
    product: productID,
  });

  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productID) } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        numOfComments: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productID, {
    avgRating: stats[0].avgRating.toFixed(1),
    numOfComments: stats[0].numOfComments,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "review created",
  });
});

const getAllReviews = asyncWrapper(async (req, res) => {
  const reviews = await Review.find({}).sort("-createdAt").lean();
  res.status(StatusCodes.OK).json({
    success: true,
    totalReviews: reviews.length,
    data: reviews,
  });
});

const getSingleReview = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id).lean();
  if (!review) throw new NotFound("resource not found");

  res.status(StatusCodes.OK).json({
    success: true,
    data: review,
  });
});

const updateReview = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findById(id);
  if (!review) throw new NotFound("resource not found");

  if (rating === review.rating && comment === review.comment) {
    throw new BadRequest("no changes detected");
  }

  const now = Date.now();
  const latestUpdate = review.updatedAt || review.createdAt;
  const diff = now - new Date(latestUpdate).getTime();
  const fiveMinutes = 1000 * 60 * 5;

  if (diff < fiveMinutes)
    throw new BadRequest("you can only update a review per 5 minutes");

  await Review.findByIdAndUpdate(id, { rating, comment });

  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(review.product) } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  await Product.findByIdAndUpdate(review.product, {
    avgRating: stats[0].avgRating.toFixed(1),
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "review updated successfully",
  });
});

const deleteReview = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  let review = await Review.findById(id).lean();
  if (!review) throw new NotFound("resource not found");

  review = await Review.findByIdAndDelete(id);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "review deleted successfully",
  });
});

export {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};
