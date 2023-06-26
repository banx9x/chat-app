const asyncHandler = require("express-async-handler");
const Conversation = require("../models/conversation.model");
const io = require("../utils/socket");

const fetchConversations = asyncHandler(async (req, res) => {
    // Query all conversations the user in
    // Not include messages
    const conversations = await Conversation.find(
        { participants: { $elemMatch: { $eq: req.user.id } }, isDraft: false },
        { messages: 0 }
    ).populate("participants latestMessage admin");

    res.status(200).json({ data: conversations });
});

const fetchOrCreateConversation = asyncHandler(async (req, res) => {
    const { participantId } = req.body;

    // Query single conversation by participant ids
    const conversation = await Conversation.findOne({
        $and: [
            { isGroup: false },
            { participants: { $elemMatch: { $eq: participantId } } },
            { participants: { $elemMatch: { $eq: req.user.id } } },
        ],
    }).populate("participants latestMessage");

    if (conversation) {
        return res.status(200).json({
            data: conversation,
        });
    }

    const newConversation = await Conversation.create({
        participants: [participantId, req.user],
    });

    await newConversation.populate("participants latestMessage");

    return res.status(201).json({
        data: newConversation,
    });
});

const createConversation = asyncHandler(async (req, res) => {
    const { participantId, message } = req.body;

    // Query single conversation by participant ids
    const conversation = await Conversation.findOne({
        $and: [
            { isGroup: false },
            { participants: { $elemMatch: { $eq: participantId } } },
            { participants: { $elemMatch: { $eq: req.user.id } } },
        ],
    }).populate("participants messages.sender latestMessage");

    // Check if conversation exists
    if (conversation) {
        return res.status(200).json({ data: conversation });
    }

    const newMessage = {
        sender: req.user,
        content: message,
    };

    // If not, create new conversation
    const newConversation = await Conversation.create({
        participants: [participantId, req.user.id],
        messages: [newMessage],
        latestMessage: newMessage,
    });

    await newConversation.populate("participants messages latestMessage");

    // Send event to user
    io.in(participantId).emit("conversation:created");

    return res.status(201).json({ data: newConversation });
});

const fetchConversation = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    // Find conversation by id
    // And user is in
    const conversation = await Conversation.findOne(
        {
            $and: [
                { _id: conversationId },
                { participants: { $elemMatch: { $eq: req.user.id } } },
            ],
        },
        { latestMessage: 0 }
    ).populate("participants messages.sender admin");

    // Check if conversation does not exists
    if (!conversation) {
        res.status(404);
        throw new Error("conversation not found");
    }

    res.status(200).json({ data: conversation });
});

const deleteConversation = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    // Find conversation by id
    // And user is in
    const conversation = await Conversation.findOne(
        {
            $and: [
                { _id: conversationId },
                { participants: { $elemMatch: { $eq: req.user.id } } },
            ],
        },
        { latestMessage: 0 }
    );

    // Check if conversation does not exists
    if (!conversation) {
        res.status(400);
        throw new Error("conversation does not exists");
    }

    const rooms = conversation.participants
        .filter((participant) => participant.id != req.user.id)
        .map((participant) => participant.id);

    // Delete conversation
    await conversation.deleteOne();

    io.in(rooms).emit("conversation:deleted", conversation);

    res.status(204).json({ data: null });
});

const postMessage = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!conversationId || !content) {
        res.status(400);
        throw new Error("No conversation id or content");
    }

    const conversation = await Conversation.findById(conversationId).populate(
        "participants"
    );

    if (!conversation) {
        res.status(400);
        throw new Error("No conversation");
    }

    conversation.messages.push({
        sender: req.user,
        content,
    });

    conversation.latestMessage =
        conversation.messages[conversation.messages.length - 1];

    let isDraft = false;

    if (conversation.isDraft) {
        isDraft = true;
        conversation.isDraft = false;
    }

    await conversation.save();

    if (isDraft) {
        io.in(
            conversation.participants
                .filter((participant) => participant.id != req.user.id)
                .map((participant) => participant.id)
        ).emit("conversation:created", conversation);
    } else {
        io.in(
            conversation.participants
                .filter((participant) => participant.id != req.user.id)
                .map((participant) => participant.id)
        ).emit(
            "conversation:messages:received",
            conversation.latestMessage,
            conversation.id
        );
    }

    res.json({ data: conversation.latestMessage });
});

const deleteMessage = asyncHandler(async (req, res) => {
    const { conversationId, messageId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
        res.status(400);
        throw new Error("no conversation");
    }

    conversation.messages.pull({
        _id: messageId,
        sender: {
            _id: req.user.id,
        },
    });

    await conversation.save();

    const rooms = conversation.participants
        .filter((participant) => participant.id != req.user.id)
        .map((participant) => participant.id);

    io.in(rooms).emit(
        "conversation:messages:deleted",
        messageId,
        conversation.id
    );

    res.status(200).json({
        data: null,
    });
});

module.exports = {
    fetchConversations,
    fetchOrCreateConversation,
    fetchConversation,
    createConversation,
    deleteConversation,
    deleteMessage,
    postMessage,
};
