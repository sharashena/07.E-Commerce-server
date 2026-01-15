// libraries
import { StatusCodes } from "http-status-codes";
import { v4 as uuid } from "uuid";

// mongoose models
import Product from "../models/Product.js";

// middlewares
import { asyncWrapper } from "../middlewares/asyncWrapper.js";

// custom errors
import { NotFound } from "../errors/index.js";

// utils
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { cloudinary } from "../configs/cloudinary.js";

const createProduct = asyncWrapper(async (req, res) => {
  if (req.body.colors && typeof req.body.colors === "string") {
    req.body.colors = JSON.parse(req.body.colors);
  }

  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadToCloudinary(file);

      images.push({
        id: result.public_id,
        width: result.width,
        height: result.height,
        resource_type: result.resource_type,
        src: result.secure_url,
      });
    }
  }

  if (images.length > 0) req.body.images = images;

  await Product.create({ ...req.body });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "product created",
  });
});

const getAllProducts = asyncWrapper(async (req, res) => {
  const products = await Product.find({})
    .select("-stock -user -updatedAt")
    .lean();

  res.status(StatusCodes.OK).json({
    success: true,
    totalProducts: products.length,
    data: products,
  });
});

const getFilteredProducts = asyncWrapper(async (req, res) => {
  const {
    name,
    category,
    company,
    minPrice,
    maxPrice,
    colors,
    vip,
    shipping,
    sort,
  } = req.query;

  let query = {};

  if (name) {
    query.$or = [
      { name: { $regex: name, $options: "i" } },
      { description: { $regex: name, $options: "i" } },
    ];
  }
  if (category) query.category = category;
  if (company) query.company = company;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (colors) {
    const colorsArr = colors.split(",");
    query.colors = { $in: colorsArr };
  }

  if (vip !== undefined) query.vip = vip === "true";
  if (shipping !== undefined) query.shipping = shipping === "true";

  let queryProducts = Product.find(query);

  if (sort) {
    let sortOption;
    switch (sort) {
      case "name":
        sortOption = { name: 1 };
        break;
      case "-name":
        sortOption = { name: -1 };
        break;
      case "price":
        sortOption = { price: 1 };
        break;
      case "-price":
        sortOption = { price: -1 };
        break;
      case "createdAt":
        sortOption = { createdAt: 1 };
        break;
      case "-createdAt":
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = {};
    }

    queryProducts = queryProducts.sort(sortOption);
  }

  const products = await queryProducts;

  res.status(StatusCodes.OK).json({
    success: true,
    data: products,
  });
});

const getSingleProduct = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id).lean();
  if (!product) throw new NotFound("resource not found");

  res.status(StatusCodes.OK).json({
    success: true,
    data: product,
  });
});

const updateProduct = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { deletedImages = [] } = req.body;

  const product = await Product.findById(id);
  if (!product) throw new NotFound("resource not found");

  if (req.body.colors && typeof req.body.colors === "string") {
    req.body.colors = JSON.parse(req.body.colors);
  }

  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadToCloudinary(file);
      images.push({
        id: result.public_id,
        width: result.width,
        height: result.height,
        resource_type: result.resource_type,
        src: result.secure_url,
      });
    }

    req.body.images = [...product.images, ...images];
  }

  let remainingImages = product.images.filter(
    prop => !deletedImages.includes(prop.id)
  );

  for (const img of product.images) {
    if (deletedImages.includes(img.id)) {
      await cloudinary.uploader.destroy(img.id);
    }
  }

  if (remainingImages.length === 0) {
    remainingImages = [
      {
        id: uuid(),
        width: 400,
        height: 200,
        resource_type: "image",
        src: "/public/assets/default.jpg",
      },
    ];
  }

  product.images = [...remainingImages, ...images];

  await product.save();
  await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "product updated successfully",
  });
});

const deleteProduct = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) throw new NotFound("resource not found");

  await product.deleteOne();

  res.status(StatusCodes.OK).json({
    success: true,
    message: "product deleted successfully",
  });
});

export {
  createProduct,
  getAllProducts,
  getFilteredProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
