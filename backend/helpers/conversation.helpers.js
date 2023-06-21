const Joi = require("joi");

const fetchOrCreateConversationSchema = Joi.object({
    participantId: Joi.objectId().required(),
});

const createGroupSchema = Joi.object({
    groupName: Joi.string().required(),
    groupAvatar: Joi.string().allow(null),
    participantIds: Joi.array().items(Joi.objectId()).required(),
});

const fetchConversationSchema = Joi.object({
    conversationId: Joi.objectId().required(),
});

const postMessageSchema = Joi.object({
    conversationId: Joi.objectId().required(),
    content: Joi.string().required(),
});

module.exports = {
    fetchOrCreateConversationSchema,
    createGroupSchema,
    fetchConversationSchema,
    postMessageSchema,
};
