import { StatusCodes } from "http-status-codes";
import { CustomError } from "./CustomError.js";

class NotFound extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

export { NotFound };
