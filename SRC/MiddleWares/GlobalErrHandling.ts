import type { NextFunction, Request, Response } from "express";

interface IError extends Error {
  statusCode: number;
}

function GlobalErrHandling(
  error: IError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(error);
  
  res.status(error.statusCode || 500).json({
    ErrMsg: error.message,
    Stack: error.stack,
    ErrCause: error.cause,
    Err: JSON.stringify(error),
  });
}
export default GlobalErrHandling;
