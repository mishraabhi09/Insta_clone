import { StatusCodes } from "http-status-codes";
const Feed = require("../models/feedModel.js");
const cloudinary = require("../utils/cloudinary/config.js");

const {
    BadRequestError,
    NotFoundError,
    UnAuthenticatedError
} = require("../errors/index.js");

const checkPermission = require("../errors/checkPermission.js");

// controller function for getting all Feed content-->>
const getAllFeed = async (req, res) => {
    const feed = await Feed.find({})
        .sort({ created: -1 }) // it comes as decreasing order, means the latest one comes first
        .populate("postedBy", "_id username fullName email avatar bio")
        .populate("comment.commentedBy", "_id username fullName email avatar bio")

    res.status(StatusCodes.OK).json(
        {
            feed
        }
    );
}

// controller function for creating the Feed-->>
const createFeed = async () => {

    const { caption, post } = req.body;

    const user = req.user.userId;

    if (!caption || !post || !user) {
        throw new BadRequestError("Please provide all Values");
    }

    const mediaRes = await cloudinary.v2.uploader.upload(post, {
        folder: "insta/feeds",
        use_filename: true,
    });

    const feed = await Feed.create(
        {
            caption,
            post: mediaRes.secure_url,
            postedBy: req.user.userId,
        }
    );

    res.status(StatusCodes.CREATED).json({
        feed
    })
};


module.exports = {
    getFeed,
    createFeed,
}

