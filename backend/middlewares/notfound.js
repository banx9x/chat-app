/**
 * Handle not found error
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
module.exports = (req, res, next) => {
    const error = new Error("Not Found - " + req.originalUrl);
    res.status(404);

    // Pass error to global error handler
    next(error);
};
