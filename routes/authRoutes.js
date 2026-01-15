import express from "express";

// joi imports

import { validate } from "../middlewares/validate.js";
import {
  forgotEmailSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validations/authValidation.js";

const router = express.Router();

// controllers import

import {
  registerUser,
  loginUser,
  forgotEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

// controllers
router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/forgot-email", validate(forgotEmailSchema), forgotEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.patch("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
