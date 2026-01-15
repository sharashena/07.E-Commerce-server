import { StatusCodes } from "http-status-codes";
import { CustomError } from "./CustomError.js";

class Forbidden extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

export { Forbidden };
