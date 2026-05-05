function SuccessResponse({ res, StatusCode = 200, Msg = "Success", data, }) {
    res.status(StatusCode).json({ Msg, data });
}
export default SuccessResponse;
