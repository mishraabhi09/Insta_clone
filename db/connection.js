import mongoose from "mongoose";

const connect = async (url) => {
    try {
        await mongoose
            .connect(url);
        console.log("Connection Established !!");
    } catch (error) {
        console.log(`Connection Error ${error}`);
    }
};

export default connect;