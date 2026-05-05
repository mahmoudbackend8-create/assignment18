class CustomError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    cause: unknown,
  ) {
    super(message, { cause });
    this.name = this.constructor.name; // to appear errorExeption name in postMan
  }
}
export default CustomError;
