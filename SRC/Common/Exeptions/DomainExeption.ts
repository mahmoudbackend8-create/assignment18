import { GraphQLError } from "graphql";
import CustomError from "./CustomError.js";

export function MapGQLError(err: CustomError) {
  throw new GraphQLError(err.message || "internal Server Error", {
    extensions: {
      statusCode: err.statusCode || 500,
      Stack: err.stack,
      Cause: err.cause,
    },
  });
}
export class BadRequestExeption extends CustomError {
  constructor(message: string = "Bad Request", cause?: unknown) {
    super(message, 400, cause);
  }
}
export class UnauthorizedExeption extends CustomError {
  constructor(
    message: string = "Unauthorized",

    cause?: unknown,
  ) {
    super(message, 401, cause);
  }
}
export class NotFoundExeption extends CustomError {
  constructor(
    message: string = "Not Found",

    cause?: unknown,
  ) {
    super(message, 404, cause);
  }
}
export class ConflictExeption extends CustomError {
  constructor(
    message: string = "Conflict",

    cause?: unknown,
  ) {
    super(message, 409, cause);
  }
}
