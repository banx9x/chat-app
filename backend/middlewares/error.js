const Joi = require("joi");
const { default: mongoose } = require("mongoose");

/**
 * Handle global error
 *
 * @param {Error} error
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
module.exports = (error, req, res, next) => {
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
