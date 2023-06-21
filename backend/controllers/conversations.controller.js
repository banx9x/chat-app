const handler = require("express-async-handler");
const User = require("../models/user.model");
const Conversation = require("../models/conversation.model");
const io = require("../socket");

exports.fetchConversations = handler(async (req, res) => {
    // Query all conversations the user in
    // Not include messages
    const conversations = await Conversation.find(
        { participants: { $elemMatch: { $eq: req.user.id } } },
        { messages: 0 }
    ).populate("participants latestMessage admin");

    return res.status(200).json({ data: conversations });
});

exports.fetchOrCreateConversation = handler(async (req, res) => {
    const { participantId } = req.body;

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

    // If not, create new conversation
    const newConversation = await Conversation.create({
        participants: [participantId, req.user.id],
    });

    await newConversation.populate("participants");

    return res.status(201).json({ data: newConversation });
});

exports.createGroup = handler(async (req, res) => {
    const { groupName, groupAvatar, participantIds } = req.body;

    // Create new group
    const newConversation = await Conversation.create({
        groupName,
        groupAvatar,
        participants: participantIds,
        isGroup: true,
        admin: req.user.id,
    });

    // Populate data
    await newConversation.populate("participants admin");

    return res.status(201).json({ data: newConversation });
});

exports.addParticipant = handler(async (req, res) => {
    const { conversationId } = req.params;
    const { participantId } = req.body;

    // Query conversation
    const conversation = await Conversation.findById(conversationId).populate(
        "participants latestMessage admin"
    );

    // Check if conversation does not exists
    if (!conversation) {
        res.status(400);
        throw new Error("conversation does not exists");
    }

    // Find user
    const user = await User.findById(participantId);

    // Check if user does not exists
    if (!user) {
        res.status(400);
        throw new Error("user does not exists");
    }

    // Add user to group
    conversation.participants.push(user);

    await conversation.save();

    return res.status(200).json({
        data: conversation.participants,
    });
});

exports.fetchConversation = handler(async (req, res) => {
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
        res.status(400);
        throw new Error("conversation does not exists");
    }

    return res.status(200).json({ data: conversation });
});

exports.postMessage = handler(async (req, res) => {
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

    await conversation.save();

    io.in(
        conversation.participants
            .filter((participant) => participant.id != req.user.id)
            .map((participant) => participant.id)
    ).emit("receivedMessage", conversation.latestMessage, conversation.id);

    return res.json({ data: conversation.latestMessage });
});
