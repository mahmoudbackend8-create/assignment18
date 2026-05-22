import { GraphQLError } from "graphql";
import CustomError from "./CustomError.js";
export function MapGQLError(err) {
    throw new GraphQLError(err.message || "internal Server Error", {
        extensions: {
            statusCode: err.statusCode || 500,
            Stack: err.stack,
            Cause: err.cause,
        },
    });
}
export class BadRequestExeption extends CustomError {
    constructor(message = "Bad Request", cause) {
        super(message, 400, cause);
    }
}
export class UnauthorizedExeption extends CustomError {
    constructor(message = "Unauthorized", cause) {
        super(message, 401, cause);
    }
}
export class NotFoundExeption extends CustomError {
    constructor(message = "Not Found", cause) {
        super(message, 404, cause);
    }
}
export class ConflictExeption extends CustomError {
    constructor(message = "Conflict", cause) {
        super(message, 409, cause);
    }
}
