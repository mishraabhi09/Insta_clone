import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
} from "../../utils/localStorage";

export const createFeed = createAsyncThunk(
  "feed/createFeed",
  async (feed, thunkAPI) => {
    try {
      const userLocal = getUserFromLocalStorage();
      if (!userLocal || !userLocal.token) {
        throw new Error('User not authenticated');
      }
      const resp = await axios.post(`/api/v1/feed`, feed, {
        headers: {
          authorization: `Bearer ${userLocal.token}`,
        },
      });

      return resp.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        removeUserFromLocalStorage();
        // Don't redirect here, let the component handle it
        return thunkAPI.rejectWithValue("Unauthorized! Logging Out");
      }
      return thunkAPI.rejectWithValue(error.response?.data?.msg || error.message || 'Something went wrong');
    }
  }
);

export const followUserFeeds = createAsyncThunk(
  "feed/followUserFeeds",
  async (_, thunkAPI) => {
    try {
      const userLocal = getUserFromLocalStorage();
      if (!userLocal || !userLocal.token) {
        throw new Error('User not authenticated');
      }
      const resp = await axios.get(`api/v1/feed/explore/getFollowing`, {
        headers: {
          authorization: `Bearer ${userLocal.token}`,
        },
      });
      return resp.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        removeUserFromLocalStorage();
        // Don't redirect here, let the component handle it
        return thunkAPI.rejectWithValue("Unauthorized! Logging Out");
      }
      return thunkAPI.rejectWithValue(error.response?.data?.msg || error.message || 'Something went wrong');
    }
  }
);

export const feedLikeDislike = createAsyncThunk(
  "feed/feedLikeDislike",
  async ({ postId }, thunkAPI) => {
    try {
      const userLocal = getUserFromLocalStorage();
      if (!userLocal || !userLocal.token) {
        throw new Error('User not authenticated');
      }
      const resp = await axios.patch(`/api/v1/feed/like/${postId}`, {}, {
        headers: {
          authorization: `Bearer ${userLocal.token}`,
        },
      });
      return resp.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        removeUserFromLocalStorage();
        // Don't redirect here, let the component handle it
        return thunkAPI.rejectWithValue("Unauthorized! Logging Out");
      }
      return thunkAPI.rejectWithValue(error.response?.data?.msg || error.message || 'Something went wrong');
    }
  }
);

export const getFeed = createAsyncThunk(
  "feed/getFeed",
  async (id, thunkAPI) => {
    try {
      const userLocal = getUserFromLocalStorage();
      if (!userLocal || !userLocal.token) {
        throw new Error('User not authenticated');
      }
      const resp = await axios.get(`/api/v1/feed/${id}`, {
        headers: {
          authorization: `Bearer ${userLocal.token}`,
        },
      });

      return resp.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        removeUserFromLocalStorage();
        // Don't redirect here, let the component handle it
        return thunkAPI.rejectWithValue("Unauthorized! Logging Out");
      }
      return thunkAPI.rejectWithValue(error.response?.data?.msg || error.message || 'Something went wrong');
    }
  }
);

export const commentOnFeed = createAsyncThunk(
  "feed/commentOnFeed",
  async ({ postId, comment }, thunkAPI) => {
    try {
      const userLocal = getUserFromLocalStorage();
      if (!userLocal || !userLocal.token) {
        throw new Error('User not authenticated');
      }
      const resp = await axios.patch(`/api/v1/feed/${postId}`, { comment }, {
        headers: {
          authorization: `Bearer ${userLocal.token}`,
        },
      });

      return resp.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        removeUserFromLocalStorage();
        // Don't redirect here, let the component handle it
        return thunkAPI.rejectWithValue("Unauthorized! Logging Out");
      }
      return thunkAPI.rejectWithValue(error.response?.data?.msg || error.message || 'Something went wrong');
    }
  }
);

export const deleteFeed = createAsyncThunk(
  "feed/deleteFeed",
  async (postId, thunkAPI) => {
    
    try {
      const userLocal = getUserFromLocalStorage();
      if (!userLocal || !userLocal.token) {
        throw new Error('User not authenticated');
      }
      const resp = await axios.delete(`/api/v1/feed/${postId}`, {
        headers: {
          authorization: `Bearer ${userLocal.token}`,
        },
      });
    
      return resp.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        removeUserFromLocalStorage();
        // Don't redirect here, let the component handle it
        return thunkAPI.rejectWithValue("Unauthorized! Logging Out");
      }
      return thunkAPI.rejectWithValue(error.response?.data?.msg || error.message || 'Something went wrong');
    }
  }
);

export const getAllFeeds = createAsyncThunk(
  "feed/getAllFeeds",
  async (_, thunkAPI) => {
    try {
      const userLocal = getUserFromLocalStorage();
      if (!userLocal || !userLocal.token) {
        throw new Error('User not authenticated');
      }
      const resp = await axios.get(`/api/v1/feed/`, {
        headers: {
          authorization: `Bearer ${userLocal.token}`,
        },
      });
      return resp.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        removeUserFromLocalStorage();
        // Don't redirect here, let the component handle it
        return thunkAPI.rejectWithValue("Unauthorized! Logging Out");
      }
      return thunkAPI.rejectWithValue(error.response?.data?.msg || error.message || 'Something went wrong');
    }
  }
);

const initialState = {
  feeds: [],
  feed: {},
  isLoading: false,
  followingUserFeeds: [],
};

export const feedSlice = createSlice({
  name: "feed",
  initialState,
  extraReducers: {
    [createFeed.pending]: (state) => {
      state.isLoading = true;
    },
    [createFeed.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      state.feeds.unshift(payload.feed);
      toast.success("Feed Created SuccessFully📷");
    },
    [createFeed.rejected]: (state, { payload }) => {
      state.isLoading = false;
      toast.error(payload || 'Failed to create feed');
    },

    [followUserFeeds.pending]: (state) => {
      state.isLoading = true;
    },
    [followUserFeeds.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      state.followingUserFeeds = payload.followingFeeds;
    },
    [followUserFeeds.rejected]: (state, { payload }) => {
      state.isLoading = false;
      toast.error(payload || 'Failed to load feeds');
    },

    [feedLikeDislike.pending]: (state) => {
      state.isLoading = true;
    },
    [feedLikeDislike.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      // The feed will be updated when re-fetched
    },
    [feedLikeDislike.rejected]: (state, { payload }) => {
      state.isLoading = false;
      toast.error(payload || 'Like operation failed');
    },

    [getFeed.pending]: (state) => {
      state.isLoading = true;
    },
    [getFeed.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      state.feed = payload.feed;
    },
    [getFeed.rejected]: (state, { payload }) => {
      state.isLoading = false;
      toast.error(payload || 'Failed to load feed');
    },

    [commentOnFeed.pending]: (state) => {
      state.isLoading = true;
    },
    [commentOnFeed.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      // Comment will be reflected after re-fetching
    },
    [commentOnFeed.rejected]: (state, { payload }) => {
      state.isLoading = false;
      toast.error(payload || 'Comment failed');
    },

    [deleteFeed.pending]: (state) => {
      state.isLoading = true;
    },
    [deleteFeed.fulfilled]: (state, action) => {
      state.isLoading = false;
      toast.success("Post Deleted!");
    },
    [deleteFeed.rejected]: (state, { payload }) => {
      state.isLoading = false;
      toast.error(payload || 'Failed to delete feed');
    },

    [getAllFeeds.pending]: (state) => {
      state.isLoading = true;
    },
    [getAllFeeds.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      state.feeds = payload.feed;
    },
    [getAllFeeds.rejected]: (state, { payload }) => {
      state.isLoading = false;
      toast.error(payload || 'Failed to load feeds');
    },
  },
});

export default feedSlice.reducer;
