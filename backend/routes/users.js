const express = require("express");
const controller = require("../controllers/users.controller");
const authenticate = require("../middlewares/auth");
const uploadAvatar = require("../middlewares/uploadAvatar");
const fileUpload = require("../utils/fileUpload");

const router = express.Router();

router.get("/", authenticate, controller.fetchUsers);
router.post("/register", controller.register);
router.post("/login", controller.login);
router.put(
    "/:userId/profile",
    authenticate,
    fileUpload.single("avatar"),
    uploadAvatar,
    controller.updateProfile
);
// router.post("/:userId/friends", authenticate, controller.sendFriendRequest);
// router.post("/:userId/friends", authenticate, controller.acceptFriendRequest);
// router.post("/:userId/friends", authenticate, controller.rejectFriendRequest);
router.post("/friends", authenticate, controller.addFriend);
router.delete("/friends", authenticate, controller.removeFriend);
// router.delete("/:userId/friends/:friendId", authenticate, controller.removeFriend);
router.get("/search", authenticate, controller.search);

module.exports = router;
