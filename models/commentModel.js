import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
    feedId: {
        type: mongoose.Types.ObjectId,
        ref: "Feed",
    },
    postedBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    comment: {
        type: String,
        required: [true, "Please provide Comment"],
    },
    time: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Comment", commentSchema);