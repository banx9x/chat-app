const express = require("express");
const {
    fetchConversation,
    fetchConversations,
    fetchOrCreateConversation,
    createGroup,
    addParticipant,
    postMessage,
} = require("../controllers/conversations.controller");
const authenticate = require("../middlewares/auth");

const router = express.Router();

router.get("/", authenticate, fetchConversations);
router.post("/", authenticate, fetchOrCreateConversation);
router.post("/groups", authenticate, createGroup);
router.get("/:conversationId", authenticate, fetchConversation);
router.post("/:conversationId/participants", authenticate, addParticipant);
router.post("/:conversationId/messages", authenticate, postMessage);

module.exports = router;
