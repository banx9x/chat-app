const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { Schema } = mongoose;

var userSchema = new Schema(
    {
        displayName: {
            type: Schema.Types.String,
            required: true,
            index: "text",
        },
        email: {
            type: Schema.Types.String,
            required: true,
        },
        password: {
            type: Schema.Types.String,
            required: true,
        },
        avatar: {
            type: Schema.Types.String,
            required: false,
        },
        friends: {
            type: [Schema.Types.ObjectId],
            ref: "User",
        },
    },
    {
        autoIndex: process.env.NODE_ENV !== "production",
        timestamps: true,
        toJSON: {
            getters: true,
            virtuals: true,
            versionKey: false,
            transform(doc, ret, options) {
                delete ret._id;
                delete ret.password;
                return ret;
            },
        },
        methods: {
            async checkPassword(password) {
                const result = await bcrypt.compare(password, this.password);
                return result;
            },
            generateToken() {
                const token = jwt.sign(
                    { id: this.id },
                    process.env.JWT_SECRET_TOKEN,
                    {
                        expiresIn: "30d",
                    }
                );

                return token;
            },
        },
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
