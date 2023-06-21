const express = require("express");
const controller = require("../controllers/users.controller");
const authenticate = require("../middlewares/auth");

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/friends", authenticate, controller.addFriend);
router.delete("/friends", authenticate, controller.removeFriend);
router.get("/search", authenticate, controller.search);

module.exports = router;
