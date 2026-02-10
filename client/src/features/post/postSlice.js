import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import axios from "axios";

import { getUserFromLocalStorage } from "../../utils/localStorage";

import { toast } from "react-toastify";



/* ======================

   HELPERS

====================== */

const authHeader = () => {

  const user = getUserFromLocalStorage();

  return {

    headers: {

      Authorization: `Bearer ${user?.token}`,

    },

  };

};



/* ======================

   THUNKS

====================== */



// CREATE POST

export const createPost = createAsyncThunk(

  "post/createPost",

  async (postData, thunkAPI) => {

    try {

      const resp = await axios.post(

        "/api/v1/post",

        postData,

        authHeader()

      );

      return resp.data;

    } catch (error) {

      return thunkAPI.rejectWithValue(

        error.response?.data?.msg || "Post creation failed"

      );

    }

  }

);



// GET FEED POSTS

export const getFeedPosts = createAsyncThunk(

  "post/getFeedPosts",

  async (_, thunkAPI) => {

    try {

      const resp = await axios.get(

        "/api/v1/post/feed",

        authHeader()

      );

      return resp.data;

    } catch (error) {

      return thunkAPI.rejectWithValue(

        error.response?.data?.msg || "Failed to load feed"

      );

    }

  }

);



// LIKE / UNLIKE POST

export const toggleLikePost = createAsyncThunk(

  "post/toggleLikePost",

  async (postId, thunkAPI) => {

    try {

      const resp = await axios.patch(

        `/api/v1/post/like/${postId}`,

        {},

        authHeader()

      );

      return resp.data;

    } catch (error) {

      return thunkAPI.rejectWithValue(

        error.response?.data?.msg || "Like failed"

      );

    }

  }

);



// COMMENT POST

export const commentPost = createAsyncThunk(

  "post/commentPost",

  async ({ postId, text }, thunkAPI) => {

    try {

      const resp = await axios.post(

        `/api/v1/post/comment/${postId}`,

        { text },

        authHeader()

      );

      return resp.data;

    } catch (error) {

      return thunkAPI.rejectWithValue(

        error.response?.data?.msg || "Comment failed"

      );

    }

  }

);



// DELETE POST

export const deletePost = createAsyncThunk(

  "post/deletePost",

  async (postId, thunkAPI) => {

    try {

      await axios.delete(

        `/api/v1/post/${postId}`,

        authHeader()

      );

      return postId;

    } catch (error) {

      return thunkAPI.rejectWithValue(

        error.response?.data?.msg || "Delete failed"

      );

    }

  }

);



/* ======================

   SLICE

====================== */



const initialState = {

  posts: [],

  isLoading: false,

};



const postSlice = createSlice({

  name: "post",

  initialState,

  reducers: {

    clearPosts: (state) => {

      state.posts = [];

    },

  },

  extraReducers: (builder) => {

    builder



      /* CREATE POST */

      .addCase(createPost.pending, (state) => {

        state.isLoading = true;

      })

      .addCase(createPost.fulfilled, (state, { payload }) => {

        state.isLoading = false;

        state.posts.unshift(payload);

        toast.success("Post created");

      })

      .addCase(createPost.rejected, (state, { payload }) => {

        state.isLoading = false;

        toast.error(payload);

      })



      /* FEED */

      .addCase(getFeedPosts.pending, (state) => {

        state.isLoading = true;

      })

      .addCase(getFeedPosts.fulfilled, (state, { payload }) => {

        state.isLoading = false;

        state.posts = payload;

      })

      .addCase(getFeedPosts.rejected, (state, { payload }) => {

        state.isLoading = false;

        toast.error(payload);

      })



      /* LIKE / UNLIKE */

      .addCase(toggleLikePost.fulfilled, (state, { payload }) => {

        const index = state.posts.findIndex(

          (post) => post._id === payload._id

        );

        if (index !== -1) {

          state.posts[index] = payload;

        }

      })



      /* COMMENT */

      .addCase(commentPost.fulfilled, (state, { payload }) => {

        const index = state.posts.findIndex(

          (post) => post._id === payload._id

        );

        if (index !== -1) {

          state.posts[index] = payload;

        }

        toast.success("Comment added");

      })



      /* DELETE */

      .addCase(deletePost.fulfilled, (state, { payload }) => {

        state.posts = state.posts.filter(

          (post) => post._id !== payload

        );

        toast.success("Post deleted");

      });

  },

});



export const { clearPosts } = postSlice.actions;

export default postSlice.reducer;