import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../apis/api';

// Thunk để xử lý đăng ký
export const register = createAsyncThunk(
  'auth/register',
  async ({ name, username, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.register(name, username, email, password);
      // Kiểm tra thông điệp phản hồi từ backend
      console.log(response);
      if (response.data.message === 'User registered successfully!') {
        return { user: response.data.user, message: response.data.message };
      } else {
        return rejectWithValue(response.data.message || 'Đăng ký không thành công');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Thunk để xử lý đăng nhập
export const login = createAsyncThunk(
  'auth/login',
  async ({ emailOrUsername, password }, { rejectWithValue }) => {
    try {
      const response = await api.login(emailOrUsername, password);
      if (response.data.message === 'User logged in successfully!') {
        return response.data.user;
      } else {
        return rejectWithValue(response.data.message || 'Đăng nhập không thành công');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Thunk để xử lý đăng nhập bằng Google
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (token, { rejectWithValue }) => {
    try {
      const response = await api.googleLogin(token);
      if (response.data.success && response.data.user) {
        return response.data.user;
      } else {
        return rejectWithValue(response.data.message || 'Đăng nhập không thành công');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    error: null,
    status: 'idle',
    successMessage: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.status = 'idle';
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload;
        state.status = 'failed';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.successMessage = action.payload.message;
        state.status = 'succeeded';
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload;
        state.status = 'failed';
        state.successMessage = null;
      })
      .addCase(googleLogin.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.error = action.payload;
        state.status = 'failed';
      });
  },
});


export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
