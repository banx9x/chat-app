const mongoose = require("mongoose");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fuayoos.mongodb.net/?retryWrites=true&w=majority`;

const client = await mongoose.connect(uri, {
    dbName: process.env.DB_NAME,
});

module.exports = client;
