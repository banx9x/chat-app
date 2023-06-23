const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const authenticate = asyncHandler(async (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            const token = req.headers.authorization.split(" ")[1];

            const decode = jwt.verify(token, process.env.JWT_SECRET_TOKEN);

            const user = await User.findById(decode.id);

            if (!user) {
                throw new jwt.JsonWebTokenError("invalid token");
            }

            req.user = user;

            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                res.status(403);
                throw new Error("token expired");
            } else if (error instanceof jwt.JsonWebTokenError) {
                res.status(401);
                throw new Error("invalid token");
            } else {
                res.status(500);
                throw error;
            }
        }
    } else {
        // No bearer token
        res.status(401);
        throw new Error("no token provide");
    }
});

module.exports = authenticate;
