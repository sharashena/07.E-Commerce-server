import Joi from "joi";

const updateSchema = Joi.object({
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
});

export { updateSchema };
