import CustomError from "./CustomError.js";
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
