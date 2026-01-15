import { StatusCodes } from "http-status-codes";
import { CustomError } from "./CustomError.js";

class BadRequest extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

export { BadRequest };
