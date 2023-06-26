const express = require("express");
const authenticate = require("../middlewares/auth");

const {
    fetchConversations,
    createConversation,
    fetchConversation,
    deleteConversation,
    postMessage,
    deleteMessage,
    fetchOrCreateConversation,
} = require("../controllers/conversations.controller");

const router = express.Router();

router.get("/", authenticate, fetchConversations);
router.post("/", authenticate, fetchOrCreateConversation);
router.get("/:conversationId", authenticate, fetchConversation);
router.delete("/:conversationId", authenticate, deleteConversation);
router.post("/:conversationId/messages", authenticate, postMessage);
router.delete(
    "/:conversationId/messages/:messageId",
    authenticate,
    deleteMessage
);

module.exports = router;
