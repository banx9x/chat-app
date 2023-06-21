const Joi = require("joi");

const registerSchema = Joi.object({
    username: Joi.string().trim().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const addFriendSchema = Joi.object({
    userId: Joi.objectId().required(),
});

const searchSchema = Joi.object({
    search: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema, addFriendSchema, searchSchema };
