import { StatusCodes } from "http-status-codes";
import Feed from "../models/feedModel.js";
import cloudinary from "../utils/cloudinary/config.js";

import {
    BadRequestError,
    NotFoundError,
    UnAuthenticatedError
} from "../errors/index.js";

import checkPermission from "../errors/checkPermission.js";

// controller function for getting all Feed content-->>
const getAllFeeds = async (req, res) => {

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

// controller function to like the feed-->>
const likeFeed = async (req, res) => {

    const { id: feedId } = req.params;

    let feed = await Feed.findById({ _id: feedId });

    if (feed.likes.includes(req.user.userId)) {
        feed = await Feed.findByIdAndUpdate(
            { _id: feedId },
            {
                $pull: { likes: req.user.userId },
            },
            {
                new: true,
            }
        );
    }
    else {
        feed = await Feed.findByIdAndUpdate(
            { _id: feedId },
            {
                $push: { likes: req.user.userId },
            },
            {
                new: true,
            }
        );
    }

    res.status(StatusCodes.OK).json(
        {
            feed
        }
    )
};

// controller function to getAllFollowingFeed-->>
const getAllFollowingFeeds = async (req, res) => {

    let followingFeeds = await Feed.find(
        {
            postedBy: { $in: req.user.userFollowing },
        }).sort({ created: -1 })
        .populate("postedBy", "_id username fullName email avatar bio")
        .populate("comments.commentedBy", "_id username fullName email avatar bio");

    followingFeeds = followingFeeds.map((data, index) => {
        return { ...data.doc, liked: data.likes.includes(req.user.userId) };
    });

    res.status(StatusCodes.OK).json(
        {
            followingFeeds
        }
    )
}

// controller function to find the currentuserFeed-->>
const currentUserFeeds = async (req, res) => {

    const feed = await Feed.find({ postedBy: req.user.userId })
        .sort({ created: -1 })
        .populate("postedBy", "_id username fullName email avatar bio")
        .populate("commnets.commentedBy", "_id username fullName email avatar bio");

    res.status(StatusCodes.OK).json(
        {
            feed
        }
    )
}

// controller function to commentonFeed-->>
const commentOnFeed = async (req, res) => {

    const { id: postId } = req.params;
    const { comment } = req.body;

    const commentObj =
    {
        comment,
        commentedBy: req.user.userId,
    };

    const commentFeed = await Feed.findByIdAndUpdate(
        {
            _id: postId,
        },
        {
            $push: { comment: commentObj },
        },
        {
            new: true,
        }
    );

    res.status(StatusCodes.OK).json(
        {
            commentFeed
        }
    );
};

// controller function to getAllComments-->>
const getAllComments = async (req, res) => {

    const { id: postId } = req.params;

    const feedComment = await Feed.findOne({ _id: postId })
        .sort({ created: -1 })
        .populate("comment.commentedBy", "_id username fullName email avatar bio");

    res.status(StatusCodes.OK).json({
        feedComment,
    })
}

export {
    getAllFeeds,
    createFeed,
    getFeed,
    deleteFeed,
    likeFeed,
    getAllFollowingFeeds,
    currentUserFeeds,
    commentOnFeed,
    getAllComments
}

