import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  addUserToLocalStorage,
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
} from "../../utils/localStorage";
import { toast } from "react-toastify";

export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (user, thunkAPI) => {
    try {
      console.log("Data send to Backend : ",user);
      const resp = await axios.post("/api/v1/auth/register", user);

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

export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (user, thunkAPI) => {
    try {
      console.log("Data send to backend :" , user);
      const resp = await axios.post("api/v1/auth/login", user);

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

export const getUserProfile = createAsyncThunk(
  "user/userProfile",
  async (id, thunkAPI) => {
    try {
      const userLocal = getUserFromLocalStorage();
      const token = userLocal?.token;
      if (!userLocal || !token) {
        throw new Error('User not authenticated');
      }
      const resp = await axios.get(`/api/v1/user/userProfile/${id}`, {
        headers: { authorization: `Bearer ${token}` },
      });

      return resp.data;
    } catch (error) {
      // Don't remove user for profile fetch errors
      return thunkAPI.rejectWithValue(error.response?.data?.msg || error.message || 'Something went wrong');
    }
  }
);

export const searchUser = createAsyncThunk(
  "user/searchUser",
  async (username, thunkAPI) => {
    try {
      const userLocal = getUserFromLocalStorage();
      const token = userLocal?.token;
      if (!userLocal || !token) {
        throw new Error('User not authenticated');
      }
      const resp = await axios.get(`/api/v1/user/search/user?search=${username}`, {
        headers: { authorization: `Bearer ${token}` },
      });

      return resp.data;
    } catch (error) {
      // Don't remove user for search errors
      return thunkAPI.rejectWithValue(error.response?.data?.msg || error.message || 'Something went wrong');
    }
  }
);

export const userUpdate = createAsyncThunk(
  "user/userUpdate",
  async (user, thunkAPI) => {
    try {
      const userLocal = getUserFromLocalStorage();
      const token = userLocal?.token;
      if (!userLocal || !token) {
        throw new Error('User not authenticated');
      }
      const resp = await axios.patch("/api/v1/user/user", user, {
        headers: { authorization: `Bearer ${token}` },
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

export const followUser = createAsyncThunk(
  "user/followUser",
  async ({ userId }, thunkAPI) => {
    try {
      const userLocal = getUserFromLocalStorage();
      const token = userLocal?.token;
      if (!userLocal || !token) {
        throw new Error('User not authenticated');
      }
      const resp = await axios.patch(`/api/v1/user/followUser`, { userId }, {
        headers: { authorization: `Bearer ${token}` },
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

export const unFollowUser = createAsyncThunk(
  "user/unFollowUser",
  async ({ userId }, thunkAPI) => {
    try {
      const userLocal = getUserFromLocalStorage();
      const token = userLocal?.token;
      if (!userLocal || !token) {
        throw new Error('User not authenticated');
      }
      const resp = await axios.patch(`/api/v1/user/unFollowUser`, { userId }, {
        headers: { authorization: `Bearer ${token}` },
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
  user: getUserFromLocalStorage(),
  isLoading: false,
  users: [],
  userProfile: {},
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logoutUser: (state, { payload }) => {
      state.user = null;
      removeUserFromLocalStorage();
      if (payload) {
        toast.success(payload);
      }
    },
  },
  extraReducers: {
    [registerUser.pending]: (state) => {
      state.isLoading = true;
    },

    [registerUser.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      state.user = payload;
      addUserToLocalStorage(payload);
      toast.success(`Hi There!, ${payload.username}`);
    },

    [registerUser.rejected]: (state, { payload }) => {
      state.isLoading = false;
      toast.error(payload || 'Registration failed');
    },

    [loginUser.pending]: (state) => {
      state.isLoading = true;
    },

    [loginUser.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      state.user = payload;
      addUserToLocalStorage(payload);
      toast.success(`Welcome Back!, ${payload.username}`);
    },

    [loginUser.rejected]: (state, { payload }) => {
      state.isLoading = false;
      toast.error(payload || 'Login failed');
    },

    [getUserProfile.pending]: (state) => {
      state.isLoading = true;
    },

    [getUserProfile.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      state.userProfile = payload;
    },

    [getUserProfile.rejected]: (state, { payload }) => {
      state.isLoading = false;
      toast.error(payload || 'Failed to load user profile');
    },

    [searchUser.pending]: (state) => {
      state.isLoading = true;
    },

    [searchUser.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      state.users = payload;
    },

    [searchUser.rejected]: (state, { payload }) => {
      state.isLoading = false;
      toast.error(payload || 'Search failed');
    },

    [userUpdate.pending]: (state) => {
      state.isLoading = true;
    },

    [userUpdate.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      state.user = payload;
      addUserToLocalStorage(payload);
      // Also update the user profile cache if it's the current user
      if (state.userProfile.payload && state.userProfile.payload.user && 
          state.userProfile.payload.user._id === payload._id) {
        state.userProfile.payload.user = payload;
      }
      toast.success(`Your Profile Updated! ${payload.username}`);
    },

    [userUpdate.rejected]: (state, { payload }) => {
      state.isLoading = false;
      toast.error(payload || 'Profile update failed');
    },

    [followUser.pending]: (state) => {
      state.isLoading = true;
    },

    [followUser.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      // Update user state if returned
      if (payload) {
        state.user = payload;
        addUserToLocalStorage(payload);
      }
      // Update the user profile cache if it exists
      if (state.userProfile && state.userProfile.payload && state.userProfile.payload.user) {
        // If the followed user is the one in the profile view, update their info
        // We get updated user info in payload, so update accordingly
        state.userProfile.payload.user = payload; // This is the current user's updated profile
      }
      toast.success(`Followed SuccessFully!`);
    },

    [followUser.rejected]: (state, { payload }) => {
      state.isLoading = false;
      toast.error(payload || 'Follow failed');
    },

    [unFollowUser.pending]: (state) => {
      state.isLoading = true;
    },

    [unFollowUser.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      // Update user state if returned
      if (payload) {
        state.user = payload;
        addUserToLocalStorage(payload);
      }
      // Update the user profile cache if it exists
      if (state.userProfile && state.userProfile.payload && state.userProfile.payload.user) {
        // Update with current user's updated profile
        state.userProfile.payload.user = payload;
      }
      toast.success(`UnFollow SuccessFully!`);
    },

    [unFollowUser.rejected]: (state, { payload }) => {
      state.isLoading = false;
      toast.error(payload || 'Unfollow failed');
    },
  },
});

export const { setFeeds, logoutUser } = userSlice.actions;

export default userSlice.reducer;
