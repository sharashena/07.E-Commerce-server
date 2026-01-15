import Joi from "joi";

const registerSchema = Joi.object({
  username: Joi.string().min(2).max(15).required().messages({
    "string.base": "username must be a string",
    "string.min": "username can't be less than 2 characters",
    "string.max": "username can't be more than 15 characters",
    "string.empty": "username is required",
    "any.required": "username is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "invalid email format",
    "string.empty": "email is required",
    "any.required": "email is required",
  }),
  password: Joi.string().min(4).max(15).required().messages({
    "string.empty": "password is required",
    "string.min": "password can't be less than 4 characters",
    "string.max": "password can't be more than 15 characters",
    "any.required": "password is required",
  }),
  role: Joi.string().valid("admin", "user").messages({
    "any.only": "{#label} is not a valid role",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "invalid email format",
    "string.empty": "email is required",
    "any.required": "email is required",
  }),
  password: Joi.string().min(4).max(15).required().messages({
    "string.empty": "password is required",
    "string.min": "password can't be less than 4 characters",
    "string.max": "password can't be more than 15 characters",
    "any.required": "password is required",
  }),
});

const forgotEmailSchema = Joi.object({
  username: Joi.string().min(2).max(15).required().messages({
    "string.base": "username must be a string",
    "string.min": "username can't be less than 2 characters",
    "string.max": "username can't be more than 15 characters",
    "string.empty": "username is required",
    "any.required": "username is required",
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "invalid email format",
    "string.empty": "email is required",
    "any.required": "email is required",
  }),
});

const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(4).max(15).required().messages({
    "string.empty": "new password is required",
    "string.min": "password can't be less than 4 characters",
    "string.max": "password can't be more than 15 characters",
    "any.required": "new password is required",
  }),
  confirmPassword: Joi.string().min(4).max(15).required().messages({
    "string.empty": "confirm password is required",
    "string.min": "password can't be less than 4 characters",
    "string.max": "password can't be more than 15 characters",
    "any.required": "confirm password is required",
  }),
});

export {
  registerSchema,
  loginSchema,
  forgotEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
