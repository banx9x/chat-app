const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");

module.exports = {
    register: asyncHandler(async (req, res) => {
        const { username, email, password } = req.body;

        // Find user by email
        let user = await User.findOne({ email });

        // Check if user already exists
        if (user) {
            res.status(400);
            throw new Error("user already exists");
        }

        // Create new user
        const newUser = await User.create({ username, email, password });

        return res.status(201).json({
            data: newUser,
            token: newUser.generateToken(),
        });
    }),

    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email }).populate("friends");

        // Check if user does not exists
        if (!user) {
            return res.status(400).json({
                error: "invalid email or password",
            });
        }

        // Compare password
        const isPasswordMatch = await user.checkPassword(password);

        // If password not match
        if (!isPasswordMatch) {
            res.status(400);
            throw new Error("invalid email or password");
        }

        return res.status(200).json({
            data: user,
            token: user.generateToken(),
        });
    }),

    addFriend: asyncHandler(async (req, res) => {
        const { friendId } = req.body;

        // Check if already friend or not
        if (req.user.friends.includes(friendId)) {
            res.status(400);
            throw new Error("already friends");
        }

        // Find user by id
        const user = await User.findById(friendId);

        // Check if user does not exists
        if (!user) {
            res.status(400);
            throw new Error("user not exists");
        }

        // Update friend list in transaction
        const session = await User.startSession();
        session.startTransaction();

        user.friends.push(req.user.id);
        await user.save({ session });

        req.user.friends.push(user.id);
        await req.user.save({ session });

        await session.commitTransaction();
        await session.endSession();

        return res.status(200).json({
            data: req.user.friends,
        });
    }),

    removeFriend: asyncHandler(async (req, res) => {
        const { friendId } = req.body;

        // Check user are friends
        if (!req.user.friends.includes(friendId)) {
            res.status(400);
            throw new Error("you are not friends");
        }

        // Find user by id
        const user = await User.findById(friendId);

        // Check if user does not exists
        if (!user) {
            res.status(400);
            throw new Error("user does not exists");
        }

        req.user.friends.pull({ _id: user.id });
        await req.user.save();

        return res.status(200).json({
            data: req.user.friends,
        });
    }),

    search: asyncHandler(async (req, res) => {
        const { search } = req.query;

        // Search by username
        const usersByUsername = await User.find(
            {
                _id: { $ne: req.user.id },
                $text: { $search: search },
            },
            { score: { $meta: "textScore" } }
        );

        // Search by email
        const usersByEmail = await User.find({
            _id: { $ne: req.user.id },
            email: { $regex: new RegExp(req.query.search, "i") },
        });

        // Combind result
        // And sort by score
        const combinedUsers = [...usersByUsername, ...usersByEmail];

        const users = Object.values(
            combinedUsers.reduce((result, user) => {
                if (result[user.id]) {
                    result[user.id].score += user.score ?? 2;
                } else {
                    result[user.id] = user.toJSON();
                    result[user.id].score = result[user.id].score ?? 2;
                }

                return result;
            }, {})
        ).sort((a, b) => {
            if (a.score != b.score) {
                a.score - b.score;
            } else if (a.username != b.username) {
                return a.username < b.username ? -1 : 1;
            } else {
                return a.email < b.email ? -1 : 1;
            }
        });

        return res.status(200).json({ data: users });
    }),
};
