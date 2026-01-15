// node imports
import express from "express";
import cron from "node-cron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// libraries import
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import helmet from "helmet";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";

// DB import
import { connectDB } from "./connect.js";

// routes import
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// error middlewares import
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// utils
import {
  deleteExpiredTokens,
  deleteExpiredVerifyEmailTokens,
  deletePendingOrders,
} from "./utils/cleanup.js";

const app = express();

// express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// logs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "logs", "access.log"),
  {
    flags: "a",
  }
);

const errorLogStream = fs.createWriteStream(
  path.join(__dirname, "logs", "error.log"),
  {
    flags: "a",
  }
);

// middlewares
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// morgan
app.use(
  morgan("combined", {
    skip: (req, res) => res.statusCode > 400,
    stream: accessLogStream,
  })
);
app.use(
  morgan("combined", {
    skip: (req, res) => res.statusCode <= 400,
    stream: errorLogStream,
  })
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);

// error middlewares
app.use(notFound);
app.use(errorHandler);

// security middlewares
app.use(helmet());
app.use(mongoSanitize());
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT),
    limit: 200,
  })
);
app.use(
  cors({
    origin: "https://e-commerce-5jlr.onrender.com",
    credentials: true,
  })
);

// environment variables
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT;

cron.schedule("*/30 * * * *", () => {
  deleteExpiredTokens();
  deleteExpiredVerifyEmailTokens();
  deletePendingOrders();
});

const start = async () => {
  try {
    app.listen(port, async () => {
      await connectDB(mongoURI);
      console.log(`Server is listening on port: ${port}`);
    });
  } catch (error) {
    console.log(`Failed to connecet to server: ${error.message}`);
    process.exit(1);
  }
};

start();
