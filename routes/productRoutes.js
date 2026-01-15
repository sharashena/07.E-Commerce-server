import express from "express";

// middlewares
import { authMiddleware } from "../middlewares/authMiddleware.js";

// joi imports
import { validate } from "../middlewares/validate.js";
import { productSchema } from "../validations/productValidation.js";

// controllers
import {
  createProduct,
  getAllProducts,
  getFilteredProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

// libraries
import multer from "multer";
import { BadRequest } from "../errors/BadRequest.js";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.includes("image/")) {
      cb(new BadRequest("only images are allowed"), false);
    }
    cb(null, true);
  },
  limits: 10,
});

const router = express.Router();

router
  .route("/")
  .post(
    [authMiddleware, validate(productSchema), upload.array("images", 10)],
    createProduct
  )
  .get(getAllProducts);
router.get("/filters", getFilteredProducts);
router
  .route("/:id")
  .get(getSingleProduct)
  .patch(
    [authMiddleware, validate(productSchema), upload.array("images", 10)],
    updateProduct
  )
  .delete(authMiddleware, deleteProduct);

export default router;
