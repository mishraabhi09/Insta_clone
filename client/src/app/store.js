import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
import feedReucer from '../features/feed/feedSlice';
import postReducer from "../features/post/postSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    feed:feedReucer,
    post: postReducer
  },
});
