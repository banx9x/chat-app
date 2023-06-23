const errorHandler = (error, req, res, next) => {
    // log error
    // console.error(error);

    if (error && error.error && error.error.isJoi) {
        return res.status(400).json({
            error: error.error.message,
        });
    }

    return res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
        error: error.message,
    });
};

module.exports = errorHandler;
