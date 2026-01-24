import mongoose from "mongoose";
import validator from "validator";

const userSchema = mongoose.Schema({

    username: {
        type: String,
        unique: true,
        required: [true, "Please Provide Username"],
        minlength: 4,
        maxlength: 20,
        trim: true
    },

    avatar: {
        type: String,
        default: image
    },
    fullName: {
        type: String,
        required: [true, "please Provide FullName"],
        trim: true,
        minlength: 3,
        unique: true,
        maxlength: 20,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: [true, "please provide your EmailId"],
        validate: {
            validator: validator.isEmail,
            message: "please provide Email"
        }

    },
    password: {
        type: String,
        required: [true, "please Give a Strong password"],
        trim: true,
        minlength: 8
    },
    bio:
    {
        type: String,
        default: "Hello there!!😊",
        minlength: 2,
        maxlength: 4
    },
    followers:
        [
            {
                type: mongoose.Types.ObjectId,
                ref: "User",
            }
        ],
    following: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User",
        }
    ]
});

module.exports = mongoose.model("User", userSchema);