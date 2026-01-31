import User from "../models/UserModel.js";
const Feed = require("../models/feedModel.js");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const cloudinary = require("../utils/cloudinary/config.js");

const {
    BadRequestError,
    NotFoundError,
    UnAuthenticatedError
} = require("../errors/index.js");

// controller to update the User-->>
const updateUser = async (req, res) => {

    const { email, fullName, bio, avatar, username } = req.body;

    // if any of these are missing-->>
    if (!email || !username || !fullName || !bio || !avatar) {
        throw new BadRequestError("Please provide all Values for Updation of User!!")
    }

    //else
    const mediaRes = await cloudinary.v2.uploader.upload(avatar,
        {
            folder: "insta-app/user-profiles",
            use_filename: true,
        }
    );

    const user = await User.findByIdAndUpdate(

        {
            _id: req.user.userId
        },
        {
            email: email,
            username: username,
            fullName: fullName,
            bio: bio,
            avatar: mediaRes.secure_url,
        },
        {
            new: true
        }
    );

    const token = jwt.sign(
        {
            userId: user._id,
            username: user.username,
            userEmail: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_LIFETIME
        }
    );

    user.password = undefined;

    res.status(StatusCodes.OK).json({
        _id: user._id,
        avatar: user.avatar,
        bio: user.bio,
        fullName: user.fullName,
        following: user.following,
        followers: user.followers,
        username: user.username,
        token,
    });
};

const followUser = async (req, res) => {

    const { userId } = req.body;
    const currentId = req.user.userId;

    //make a user-->>
    let user;

    // add in followers-->>
    user = await User.findByIdAndUpdate(
        userId,
        {
            $push: { followers: currentId },
        },
        {
            new: true
        }
    );

    // add in following-->>
    user = await User.findByIdAndUpdate(
        currentId,
        {
            $push: { following: userId }
        },
        {
            new: true,
        }
    );

    const token = jwt.sign(

        {
            userId: user._id,
            useremail: user.email,
            username: user.username,
            userFollowing: user.following,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_LIFETIME,
        }

    );

    user.password = undefined;

    res.status(StatusCodes.OK).json(
        {
            _id: user._id,
            bio: user.bio,
            email: user.email,
            fullName: user.fullName,
            followers: user.followers,
            following: user.following,
            username: user.username,
            token,
        }
    )
};

module.exports = {
    updateUser, followUser
}