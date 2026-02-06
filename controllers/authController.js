import User from "../models/UserModel.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import {
    BadRequestError,
    NotFoundError,
    UnAuthenticatedError
} from "../errors/index.js";

// register Route-->>
const register = async (req, res) => {
    console.log("Req is coming from frontend : " , req.body);

    const { username, fullName, email, password } = req.body;

    if (!email || !password || !username || !fullName) {
        throw new BadRequestError("Please provide All Values");
    };

    const isUserExists = await User.findOne({ email });

    if (isUserExists) {
        throw new BadRequestError("User Already Exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const user = await User.create({

        username,
        fullName,
        email,
        password: hashedPassword

    });

    //generating the token-->>
    const token = jwt.sign(
        {
            userId: user._id,
            username: user.username,
            userEmail: user.email,
            userFollowing: user.following,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_LIFETIME
        }
    );

    user.password = undefined;

    res.status(StatusCodes.CREATED).json(
        {
            _id: user._id,
            avatar: user.avatar,
            bio: user.bio,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            followers: user.followers,
            following: user.following,
            token,
        })
};


const login = async (req, res) => {
    
    console.log(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        throw new BadRequestError("Please enter all the Values");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new NotFoundError("Invalid Creadentials");
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
        throw new NotFoundError("Invalid Credentials");
    }

    const token = jwt.sign({
        userId: user._id,
        username: user.username,
        userEmail: user.email,
        userFollowing: user.following,
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
        email: user.email,
        fullName: user.fullName,
        followers: user.followers,
        following: user.following,
        username: user.username,
        token,
    });
}



export { register, login};