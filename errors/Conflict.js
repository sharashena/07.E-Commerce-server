import { StatusCodes } from "http-status-codes";
import { CustomError } from "./CustomError.js";

class Conflict extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.CONFLICT;
  }
}

export { Conflict };
