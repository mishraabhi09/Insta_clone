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
};

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
    });
};

// controller function to getFeed -->>
const getFeed = async (req, res) => {

    const { id: postId } = req.params;

    const feed = await Feed.findById({ _id: postId })
        .populate("postedBy", "_id username fullName email avatar bio")
        .populate("comment.commentedBy", "_id username fullName email avatar bio");


    res.status(StatusCodes.OK).json(
        {
            feed
        }
    );
};

// controller function to delete the feed-->>
const deleteFeed = async (req, res) => {

    const { id: postId } = req.params;

    const feed = await Feed.findOne({ _id: postId });

    if (!feed) {
        throw new NotFoundError(`No feed with Id : ${id}`);
    }

    checkPermission(req.user, feed.postedBy);

    const deleteFeed = await Feed.findByIdAndRemove({ _id: postId });

    res.status(StatusCodes.OK).json(
        {
            deleteFeed
        }
    )
};

const likeFeed = async () => {
     
    const {id : feedId} = req.params;

    let feed = await Feed.findById({_id : feedId});
}

module.exports = {
    getAllFeed,
    createFeed,
    getFeed,
    deleteFeed
}

