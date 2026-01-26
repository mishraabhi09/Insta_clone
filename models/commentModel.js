const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({

    feedId: {
        type: mongoose.Types.ObjectId,
        ref: "Feed"
    },
    postedBy:
    {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    comment: {
        type: String,
        required: [true, "PLease provide Comment"],
    },
    time:
    {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model("Comment", commentSchema);