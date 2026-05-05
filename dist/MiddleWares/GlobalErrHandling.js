function GlobalErrHandling(error, req, res, next) {
    console.log(error);
    res.status(error.statusCode || 500).json({
        ErrMsg: error.message,
        Stack: error.stack,
        ErrCause: error.cause,
        Err: JSON.stringify(error),
    });
}
export default GlobalErrHandling;
