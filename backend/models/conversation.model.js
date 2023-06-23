const mongoose = require("mongoose");

const { Schema } = mongoose;

const messageSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: Schema.Types.String,
            required: true,
            trim: true,
            index: "text",
        },
    },
    {
        autoIndex: process.env.NODE_ENV !== "production",
        timestamps: true,
        toJSON: {
            getters: true,
            virtuals: true,
            versionKey: false,
            transform: (doc, ret, options) => {
                delete ret._id;
                return ret;
            },
        },
    }
);

const conversationSchema = new Schema(
    {
        groupName: {
            type: Schema.Types.String,
            required: function () {
                return this.isGroup;
            },
        },
        groupAvatar: {
            type: Schema.Types.String,
        },
        participants: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            required: true,
        },
        messages: {
            type: [messageSchema],
            required: true,
            default: [],
        },
        latestMessage: {
            type: messageSchema,
            required: false,
            default: null,
        },
        isGroup: {
            type: Schema.Types.Boolean,
            required: true,
            default: false,
        },
        admin: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: function () {
                return this.isGroup;
            },
        },
    },
    {
        autoIndex: false,
        timestamps: true,
        statics: {},
        virtuals: {},
        toJSON: {
            getters: true,
            virtuals: true,
            versionKey: false,
            transform: (doc, ret, options) => {
                delete ret._id;
                return ret;
            },
        },
        methods: {
            isAdmin(user) {
                return this.admin._id.equals(user._id);
            },
        },
    }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
