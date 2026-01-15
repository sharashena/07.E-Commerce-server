import Joi from "joi";

export const createReviewSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .strict()
    .positive()
    .min(0)
    .max(5)
    .required()
    .messages({
      "number.base": "rating must be a number",
      "number.min": "rating can't be less than 0",
      "number.max": "rating can't be more than 5",
      "number.positive": "rating must be a positive number",
      "number.integer": "rating must be a integer number",
      "any.required": "rating is required",
    }),
  comment: Joi.string().max(500).messages({
    "string.base": "comment must be a string",
    "string.max": "comment length can't be more than 500 characters",
  }),
  user: Joi.string().required().messages({
    "string.empty": "user id is required",
    "any.required": "user id is required",
    "string.base": "user id must be a stirng",
  }),
  product: Joi.string().required().messages({
    "string.empty": "product id is required",
    "any.required": "product id is required",
    "string.base": "product id must be a stirng",
  }),
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .strict()
    .positive()
    .min(0)
    .max(5)
    .required()
    .messages({
      "number.base": "rating must be a number",
      "number.min": "rating can't be less than 0",
      "number.max": "rating can't be more than 5",
      "number.positive": "rating must be a positive number",
      "number.integer": "rating must be a integer number",
      "any.required": "rating is required",
    }),
  comment: Joi.string().max(500).messages({
    "string.base": "comment must be a string",
    "string.max": "comment length can't be more than 500 characters",
  }),
});
