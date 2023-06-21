const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const conversationsRouter = require("./routes/conversations");
const notfound = require("./middlewares/notfound");
const error = require("./middlewares/error");

const app = express();

dotenv.config();

mongoose
    .connect(process.env.DB_URI, {
        dbName: process.env.DB_NAME,
    })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/users", usersRouter);
app.use("/api/conversations", conversationsRouter);
app.use(express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV === "production") {
    app.get("*", (req, res, next) => {
        return res.sendFile(path.join(__dirname, "public", "index.html"));
    });
} else {
    app.use("/", indexRouter);
}

app.use(notfound);
app.use(error);

module.exports = app;
