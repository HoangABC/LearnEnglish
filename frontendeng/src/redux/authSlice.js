import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../apis/api';

// Thunk để xử lý đăng ký
export const register = createAsyncThunk(
  'auth/register',
  async ({ name, username, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.register(name, username, email, password);
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

// Thunk để cập nhật LevelId của người dùng
export const updateUserLevel = createAsyncThunk(
  'auth/updateUserLevel',
  async ({ id, levelId }, { rejectWithValue }) => {
    try {
      const response = await api.updateUserLevel(id, levelId);
      if (response.status === 200) {
        return { id, levelId };
      } else {
        return rejectWithValue('Cập nhật LevelId không thành công');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Thunk để lấy danh sách Levels
export const fetchLevels = createAsyncThunk(
  'auth/fetchLevels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.fetchLevels();
      return response.data; // Giả sử response.data là danh sách các levels
    } catch (error) {
      console.error('Fetch Levels Error:', error); // Thêm log để kiểm tra lỗi
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi lấy dữ liệu Levels');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    levels: [], // Thêm state để lưu danh sách levels
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
      // Xử lý các trạng thái của login
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
      // Xử lý các trạng thái của register
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
      // Xử lý các trạng thái của googleLogin
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
      })
      // Xử lý các trạng thái của updateUserLevel
      .addCase(updateUserLevel.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserLevel.fulfilled, (state, action) => {
        const { id, levelId } = action.payload;
        if (state.user && state.user.id === id) {
          state.user.levelId = levelId;
        }
        state.status = 'succeeded';
      })
      .addCase(updateUserLevel.rejected, (state, action) => {
        state.error = action.payload;
        state.status = 'failed';
      })
      // Xử lý các trạng thái của fetchLevels
      .addCase(fetchLevels.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLevels.fulfilled, (state, action) => {
        state.levels = action.payload; // Lưu danh sách levels vào state
        state.status = 'succeeded';
      })
      .addCase(fetchLevels.rejected, (state, action) => {
        state.error = action.payload;
        state.status = 'failed';
      });
  },
});

export const { logout, setUser } = authSlice.actions;

export default authSlice.reducer;
