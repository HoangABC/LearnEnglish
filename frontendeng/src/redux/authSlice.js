import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../apis/api';

// Thunk để xử lý đăng ký
export const register = createAsyncThunk(
  'auth/register',
  async ({ name, username, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.register(name, username, email, password);
      return {
        user: response.data.user,
        message: response.data.message,
      };
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

// Thunk để cập nhật tên người dùng
export const updateUserName = createAsyncThunk(
  'auth/updateUserName',
  async ({ userId, name }, { rejectWithValue }) => {
    try {
      const response = await api.updateUserName(userId, name);
      if (response.status === 200) {
        return { userId, name }; 
      } else {
        return rejectWithValue('Cập nhật tên người dùng không thành công');
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
      return response.data;
    } catch (error) {
      console.error('Fetch Levels Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi lấy dữ liệu Levels');
    }
  }
);

// Thunk để thay đổi mật khẩu
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ userId, currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.changePassword(userId, currentPassword, newPassword);
      if (response.status === 200) {
        return response.data.message; // Thành công
      } else if (response.status === 400) {
        return rejectWithValue('Mật khẩu cũ không chính xác');
      } else {
        return rejectWithValue(response.data.message || 'Thay đổi mật khẩu không thành công');
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
      // Các state của login
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
      // Các state của register
      .addCase(register.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.successMessage = action.payload.message;
        state.error = null;
        state.status = 'succeeded';
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload;
        state.status = 'failed';
        state.successMessage = null;
      })
      // Các state của googleLogin
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
      // Các state của updateUserLevel
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
      // Các state của fetchLevels
      .addCase(fetchLevels.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLevels.fulfilled, (state, action) => {
        state.levels = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchLevels.rejected, (state, action) => {
        state.error = action.payload;
        state.status = 'failed';
      })
      // Các state của updateUserName
      .addCase(updateUserName.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserName.fulfilled, (state, action) => {
        const { userId, name } = action.payload;
        if (state.user && state.user.id === userId) {
          state.user.name = name; 
        }
        state.status = 'succeeded';
      })
      .addCase(updateUserName.rejected, (state, action) => {
        state.error = action.payload;
        state.status = 'failed';
      })
      // Các state của changePassword
      .addCase(changePassword.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        console.log('Change Password Success:', action.payload); // Log message từ backend
        state.successMessage = action.payload; // Phản hồi thành công từ backend
        state.error = null;
        state.status = 'succeeded';
      })      
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.payload;
        state.status = 'failed';
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
