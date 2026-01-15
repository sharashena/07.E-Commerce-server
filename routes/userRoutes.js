import express from "express";

// middlewares
import {
  authMiddleware,
  authorizePermission,
} from "../middlewares/authMiddleware.js";

// joi imports
import { validate } from "../middlewares/validate.js";
import { updateSchema } from "../validations/userValidation.js";

// multer
import multer from "multer";

// custom error
import { BadRequest } from "../errors/BadRequest.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new BadRequest("only image format is allowed"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 1024 * 1024 * 5 },
});

// controllers import

import {
  getAllUsers,
  getCurrentUser,
  getSingleUser,
  verifyEmail,
  sendVerifyEmail,
  updateUser,
  deleteUser,
  logoutUser,
} from "../controllers/userController.js";

router.get("/", [authMiddleware, authorizePermission("admin")], getAllUsers);
router.get("/current-user", authMiddleware, getCurrentUser);
router.post("/send-verify-email", authMiddleware, sendVerifyEmail);
router.post("/verify-email", authMiddleware, verifyEmail);
router.post("/logout", authMiddleware, logoutUser);
router
  .route("/:id")
  .get([authMiddleware, authorizePermission("admin")], getSingleUser)
  .patch(
    [authMiddleware, validate(updateSchema), upload.single("avatar")],
    updateUser
  )
  .delete(authMiddleware, deleteUser);

export default router;
