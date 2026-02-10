import User from "../models/UserModel.js";
import Feed from "../models/feedModel.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinaryConfig.js";

import { 
    BadRequestError,
    NotFoundError,
    UnAuthenticatedError
} from "../errors/index.js";

// controller to update the User-->>
const updateUser = async (req, res) => {
    const { email, fullName, bio, avatar, username } = req.body;

    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
        throw new NotFoundError("User not found");
    }

    let avatarUrl = currentUser.avatar;
    if (avatar) {
        const mediaRes = await cloudinary.v2.uploader.upload(avatar, {
            folder: "insta-app/user-profiles",
            use_filename: true,
        });
        avatarUrl = mediaRes.secure_url;
    }

    const user = await User.findByIdAndUpdate(
        { _id: req.user.userId },
        {
            email: email || currentUser.email,
            username: username || currentUser.username,
            fullName: fullName || currentUser.fullName,
            bio: bio || currentUser.bio,
            avatar: avatarUrl,
        },
        { new: true }
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

//controller to follow the User-->>
const followUser = async (req, res) => {

    // userId you want to follow comes from frontend
    // when you click follow to someone's id
    const { userId } = req.body;

    // current logged-in user Id-->>
    // req.user already assures that the user is already logged-in
    const currentId = req.user.userId;

    //make a user-->>
    let user;

    // add in followers-->>
    user = await User.findByIdAndUpdate(
        userId,
        {
            $addToSet: { followers: currentId },
        },
        {
            new: true,
        }
    );

    // add in following-->>
    user = await User.findByIdAndUpdate(
        currentId,
        {
            $addToSet: { following: userId },
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

        // Control flow-->> 

        // Step - by - step flow:

        // 1 - User clicks Follow
        // 2 - Frontend sends userId to backend
        // 3 - Auth middleware adds req.user
        // 4 - Backend:

        // Adds current user to target user’s followers

        // Adds target user to current user’s following
        // 5️ - Backend generates new JWT token
        // 6️ - Backend sends updated user data + token
        // 7 - Frontend updates UI and stores token

    );

    // insures that the password can send to the frontend side
    // hence clean the password
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

//controller to unfollow the User-->>
const unFollowUser = async (req, res) => {

    // below is the id of the user send by frontend 
    // whom you want to unfollow by clicking on the unfollow button
    const { userId } = req.body;

    // this is the current logged-in user id
    const currentId = req.user.userId;

    // default user-->>
    let user;

    // remove from followers, samne wali ki id se-->>
    user = await User.findByIdAndUpdate(
        userId,
        {
            $pull: { followers: currentId },
        },
        // return the updated followers list at the end-->>
        {
            new: true,
        }
    );

    // remove from following-->>
    user = await User.findByIdAndUpdate(
        currentId,
        {
            $pull: { following: userId },
        },
        // returning the updated following list-->>
        {
            new: true,
        }
    );

    // this fresh token is passed to the frontend-->>
    const token = jwt.sign(
        {
            username: user.username,
            useremail: user.email,
            userId: user._id,
            userFollowing: user.userFollowing
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_LIFETIME,
        }
    );

    // make sure that the password is not passed to client side-->>
    user.password = undefined;

    res.status(StatusCodes.OK).json(
        {
            id: user._id,
            avatar: user.avatar,
            bio: user.bio,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            followers: user.followers,
            following: user.following,
            token,
        }
    )
};

//controller for seeing the userprofile of a person-->>
const userProfile = async (req, res) => {

    // id of the user whom id you want to see
    // client side this id to server side-->>
    // extract the user_id from the URL
    // example -->> /api/user/profile/65ab12cd34
    // req.params = { id: "65ab12cd34" }
    const { id: user_id } = req.params;

    let user = await User.findOne({ _id: user_id })
        .populate("followers", "_id username fullName email avatar bio")
        .populate("following", "_id username fullName email avatar bio");

    if (!user) {
        return res.status(404).json({ msg: "User not found" });
    }

    let feeds = await Feed.find({ postedBy: user_id })
        .sort({ createdAt: -1 })
        .populate("postedBy", "_id username fullName email avatar bio")
        .populate("comments.commentedBy", "_id username fullName email avatar bio");

    const mappedFeeds = feeds.map((data) => ({ ...data._doc, liked: data.likes.includes(user_id) }));
    const limitedFeeds = mappedFeeds.slice(0, 10);

    user.password = undefined;

    let totalFollowers = user.followers.length;
    let totalFollowing = user.following.length;
    let totalPosts = mappedFeeds.length;

    res.status(StatusCodes.OK).json({ user, totalFollowers, totalFollowing, totalFollowings: totalFollowing, totalPosts, feed: limitedFeeds });

    // Control flow-->>
    // 1️ - Frontend requests user profile by ID
    // 2️-  Backend extracts user_id from URL
    // 3️ - Backend fetches user document
    // 4️ - Backend populates followers & following
    // 5️ - Backend fetches all posts by that user
    // 6️ - Backend sorts posts by date
    // 7️ - Backend populates:

    // post owner

    // comment authors
    // 8️ - Backend calculates counts
    // 9️ - Backend removes password
    // 10 -Backend sends profile + feed data
};

//controller to Search the User-->>
const searchUser = async (req, res) => {

    const { search } = req.query;

    if (!search) {
        return res.status(400).json({ msg: "Search query is required" });
    }

    const user = await User.find(
        {
            username: { $regex: search, $options: "i" },
        }
    )
        // removes the password from the result-->>
        .select("-password")
        .limit(10);
    // limit is used for less load on DB
    res.status(StatusCodes.OK).json(
        {
            user
        }
    );

    // Control Flow-->>
    // 1️ - User types text in search box
    // 2️ - Frontend sends request with query param
    // 3️ - Backend extracts search
    // 4️ - MongoDB searches usernames using regex
    // 5️ - Password field removed
    // 6️ - Backend returns matching users
    // 7️ - Frontend displays results in dropdown / list
};

export {
    updateUser,
    followUser,
    unFollowUser,
    userProfile,
    searchUser
}