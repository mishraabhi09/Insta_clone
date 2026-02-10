import mongoose  from "mongoose";

const feedSchema = mongoose.Schema({

    postedBy:
    {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "Please provide user"],
    },
    createdAt:
    {
        type: Date,
        default: Date.now, // give the default date
    },
    post:
    {
        type: String,
        required: [true, "Please provide Image for feed"],
    },
    caption:
    {
        type: String,
        required: [true, "please give description for the feed"]
    },
    likes: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User",
        }
    ],

    comments: [
        {
            comment: {
                type: String,
                required: [true, "Please provide comment"],
            },
            commentedBy: {
                type: mongoose.Types.ObjectId,
                ref: "User",
            },
            commentTime: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

export default mongoose.model("Feed", feedSchema);