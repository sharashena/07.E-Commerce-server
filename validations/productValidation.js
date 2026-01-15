import Joi from "joi";
import { v4 as uuid } from "uuid";

export const productSchema = Joi.object({
  name: Joi.string().min(2).max(20).required().messages({
    "string.base": "product name must be a string",
    "string.min": "product name can't be less than 2 characters",
    "string.max": "product name can't be more than 20 characters",
    "string.empty": "product name is required",
    "any.required": "product name is required",
  }),
  category: Joi.string()
    .valid("living room", "kitchen", "office,", "kids", "dining", "bedroom")
    .required()
    .messages({
      "any.only": "{{#value}} is not a valid category",
      "any.required": "category is required",
      "string.base": "category must be a string",
    }),
  company: Joi.string()
    .valid("ikea", "marcos", "liddy", "caressa")
    .required()
    .messages({
      "any.only": "{{#value}} is not a valid company",
      "any.required": "company is required",
      "string.base": "company must be a string",
    }),
  price: Joi.number().positive().min(0).messages({
    "number.base": "product price must be a number",
    "number.min": "product price can't be less than 0",
    "number.positive": "product price must be a positive number",
  }),
  description: Joi.string().max(500).messages({
    "string.base": "product description must be a string",
    "string.max": "product description can't be more than 500 characters",
  }),
  colors: Joi.array().items(
    Joi.string()
      .pattern(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
      .min(1)
      .required()
      .messages({
        "array.base": "colors must be an array",
        "array.min": "choose at least one color",
      })
  ),
  images: Joi.array()
    .items(Joi.object())
    .messages({
      "array.base": "images must be an array",
    })
    .default([
      {
        id: uuid(),
        width: 400,
        height: 200,
        resource_type: "image",
        src: "/public/assets/default.jpg",
      },
    ]),
  stock: Joi.number().integer().positive().min(0).required().messages({
    "number.base": "product stock must be a number",
    "number.min": "product stock can't be less than 0",
    "number.integer": "product stock must be an integer",
    "number.positive": "product stock must be a positive number",
    "any.required": "product stock is required",
  }),
  avgRating: Joi.number().positive().min(0).max(5).messages({
    "number.base": "product rating must be a number",
    "number.min": "product rating can't be less than 0",
    "number.max": "product rating can't be more than 5",
    "number.positive": "product rating must be a positive number",
  }),
  numOfComments: Joi.number().integer().positive().min(0).messages({
    "number.base": "number of comments must be a number",
    "number.min": "number of comments can't be less than 0",
    "number.positive": "number of comments must be a positive number",
    "number.integer": "number of comments must be an integer",
  }),
  user: Joi.string().required().messages({
    "string.base": "user id must be a string",
    "string.empty": "user id is required",
    "any.required": "user id is required",
  }),
});
