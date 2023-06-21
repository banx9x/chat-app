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
router.get("/:conversationId", authenticate, fetchConversation);
router.post("/:conversationId/messages", authenticate, postMessage);
// router.delete("/:conversationId/messages/:messageId", authenticate, deleteMessage)
router.post("/groups", authenticate, createGroup);
router.put("/:groupId/participants", authenticate, addParticipant);
// router.delete("/:groupId/participants/:participantId", authenticate, removeParticipant)

module.exports = router;
