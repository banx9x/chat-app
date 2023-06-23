const express = require("express");
const authenticate = require("../middlewares/auth");
const {
    createGroup,
    deleteGroup,
    addParticipant,
    removeParticipant,
} = require("../controllers/groups.controller");

const router = express.Router();

router.post("/", authenticate, createGroup);
router.delete("/:groupId", authenticate, deleteGroup);
router.post("/:groupId/participants", authenticate, addParticipant);
router.delete(
    "/:groupId/participants/:participantId",
    authenticate,
    removeParticipant
);

module.exports = router;
