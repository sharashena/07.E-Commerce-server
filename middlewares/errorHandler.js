import { StatusCodes } from "http-status-codes";

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let errors = err.message || err || "something went wrong";

  if (err.code === 11000) {
    statusCode = StatusCodes.CONFLICT;
    errors = Object.keys(err.keyValue).map(prop => ({
      field: prop,
      message: `${prop} already exists`,
    }));
  }

  if (err.name === "CastError") {
    statusCode = StatusCodes.BAD_REQUEST;
    errors = {
      field: err.path,
      message: `param is incorrect: ${err.path}`,
    };
  }
  if (err.name === "ValidationError") {
    errors = Object.values(err.errors).map(prop => ({
      field: prop.path,
      message: prop.message,
    }));
    statusCode = StatusCodes.BAD_REQUEST;
  }

  if (err.name === "MulterError") {
    statusCode = StatusCodes.BAD_REQUEST;
    errors = {
      field: err.field,
      message: "only one image is allowed",
    };
  }
  if (err.name === "LIMIT_FILE_SIZE") {
    statusCode = StatusCodes.BAD_REQUEST;
    errors = {
      field: err.field,
      message: "file size limit exceeded",
    };
  }

  res.status(statusCode).json({ success: false, errors });
};
