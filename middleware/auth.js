import jwt from "jsonwebtoken";

const auth = async (req, res , next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        throw new Error("Authentication Invalid!!");
    }

    // generating the token-->>>
    const token = authHeader.split(" ")[1];

    try {

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        req.user = { userId: payload.userId, userFollowing: payload.userFollowing };

    } catch (error) {
        throw new error("Authentication Invalid!!");
    };

    next();
};

export default auth;