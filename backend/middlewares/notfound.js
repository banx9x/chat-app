const notFoundHandler = (req, res, next) => {
    const error = new Error("Not Found - " + req.originalUrl);
    res.status(404);

    // Pass error to global error handler
    next(error);
};

module.exports = notFoundHandler;
