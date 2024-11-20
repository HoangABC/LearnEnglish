// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../apis/api';

export const login = createAsyncThunk(
    'auth/login',
    async ({ emailOrUsername, password }, { rejectWithValue }) => {
      try {
        const response = await api.login(emailOrUsername, password);
        if (response.status === 200) {
          return response.data;
        } else {
          return rejectWithValue(response.data.message || 'Đăng nhập không thành công');
        }
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
      }
    }
  );

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.logout();
    } catch (err) {
      return rejectWithValue(err.response.data); 
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    status: 'idle', 
    error: null,
  },
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    resetAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('Login successful:', action.payload);
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        console.error('Login failed:', action.payload);
        state.status = 'failed';
        state.error = action.payload;
      })
      // logout
      .addCase(logout.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = 'succeeded';
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setAuth, resetAuth } = authSlice.actions;

export default authSlice.reducer;
