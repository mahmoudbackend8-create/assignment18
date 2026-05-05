import type { Response } from "express";

function SuccessResponse<T>({
  res,
  StatusCode = 200,
  Msg = "Success",
  data,
}: {
  res: Response;
  StatusCode?: number;
  Msg?: string;
  data?: T;
}) {
  res.status(StatusCode).json({ Msg, data });
}
export default SuccessResponse
