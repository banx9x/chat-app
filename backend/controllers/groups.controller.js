const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const Conversation = require("../models/conversation.model");
const io = require("../utils/socket");

const createGroup = asyncHandler(async (req, res) => {
    const { groupName, groupAvatar, participantIds } = req.body;

    // Create new group
    const newGroup = await Conversation.create({
        groupName,
        groupAvatar,
        participants: participantIds,
        isGroup: true,
        admin: req.user.id,
    });

    // Populate data
    await newGroup.populate("participants admin");

    const rooms = participantIds.filter(
        (participantId) => participantId != req.user.id
    );

    io.in(rooms).emit("group:created", newGroup);

    return res.status(201).json({ data: newGroup });
});

const deleteGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    // Find group by ID
    const group = await Conversation.findById(groupId).populate(
        "participants admin"
    );

    // Check if group does not exists
    if (!group) {
        res.status(400);
        throw new Error("no group");
    }

    // Check if user is not admin
    if (!group.isAdmin(req.user)) {
        res.status(403);
        throw new Error("not admin");
    }

    // Get list of participants in group
    const rooms = group.participants
        .filter((participant) => participant.id != req.user.id)
        .map((participant) => participant.id);

    // Delete group
    await group.deleteOne();

    // Send event to participants
    io.in(rooms).emit("group:deleted", group);

    return res.status(204).json({ data: null });
});

const addParticipant = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { participantId } = req.body;

    // Query conversation
    const group = await Conversation.findById(groupId).populate(
        "participants latestMessage admin"
    );

    // Check if conversation does not exists
    if (!group) {
        res.status(400);
        throw new Error("conversation does not exists");
    }

    // Check admin
    if (!group.isAdmin(req.user)) {
        res.status(403);
        throw new Error("you are not admin");
    }

    // Find user
    const user = await User.findById(participantId);

    // Check if user does not exists
    if (!user) {
        res.status(400);
        throw new Error("user does not exists");
    }

    const rooms = group.participants
        .filter((participant) => participant.id != req.user.id)
        .map((participant) => participant.id);

    // Add user to group
    group.participants.push(user);

    await group.save();

    // Send event to user
    io.in(participantId).emit("group:participants:added", group);
    io.in(rooms).emit("group:participants:joined", user);

    return res.status(200).json({
        data: group.participants,
    });
});

const removeParticipant = asyncHandler(async (req, res) => {
    const { groupId, participantId } = req.params;

    // Find group by ID
    const group = await Conversation.findById(groupId).populate("participants");

    // Check if group does not exists
    if (!group) {
        res.status(400);
        throw new Error("no group");
    }

    // Check if user is not admin
    if (!group.isAdmin(req.user)) {
        res.status(403);
        throw new Error("not admin");
    }

    // Remove user
    group.participants.pull({ _id: participantId });
    await group.save();

    const rooms = group.participants
        .filter((participant) => participant.id != req.user.id)
        .map((participant) => participant.id);

    // Send event to user
    io.in(participantId).emit("group:participants:removed", group);
    io.in(rooms).emit("group:participants:left", participantId);

    return res.status(200).json({ data: null });
});

module.exports = {
    createGroup,
    deleteGroup,
    addParticipant,
    removeParticipant,
};
