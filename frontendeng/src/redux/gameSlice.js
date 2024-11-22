import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../apis/api';

// Hàm xử lý lỗi
const handleError = (error, defaultMessage) => {
  if (error.response) {
    return error.response.data.message || defaultMessage;
  } else if (error.request) {
    return 'Không có phản hồi từ máy chủ';
  } else {
    return 'Lỗi: ' + error.message;
  }
};

// Thunk để lấy từ để đoán
export const fetchWordGuess = createAsyncThunk(
  'games/fetchWordGuess',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.fetchWordGuess(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleError(error, 'Có lỗi xảy ra khi lấy từ đoán'));
    }
  }
);

// Thunk để gửi câu trả lời đoán từ
export const submitWordGuess = createAsyncThunk(
  'games/submitWordGuess',
  async ({ userId, wordId, answer }, { rejectWithValue, signal }) => {
    try {
      // Giảm timeout xuống 3 giây
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 3000)
      );
      
      const controller = new AbortController();
      signal.addEventListener('abort', () => controller.abort());

      const responsePromise = api.submitWordGuess(userId, wordId, answer);
      
      const response = await Promise.race([responsePromise, timeoutPromise]);
      return response.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        return rejectWithValue('Request was cancelled');
      }
      return rejectWithValue(handleError(error, 'Error submitting answer'));
    }
  }
);

// State ban đầu
const initialState = {
  wordForGuess: null,
  error: null,
  status: 'idle',
  dataLoaded: false,
  successMessage: null,
};

// Slice
const gameSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    setDataLoaded: (state, action) => {
      state.dataLoaded = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWordGuess.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWordGuess.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.wordForGuess = action.payload;
        state.error = null;
        state.dataLoaded = true; // Cập nhật dữ liệu đã tải thành công
      })
      .addCase(fetchWordGuess.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.dataLoaded = false; // Đặt lại khi bị lỗi
      })
      .addCase(submitWordGuess.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(submitWordGuess.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.successMessage = action.payload.message; // Lưu thông báo thành công
        state.error = null;
      })
      .addCase(submitWordGuess.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.successMessage = null; // Đặt lại thông báo thành công khi có lỗi
      });
  },
});

// Xuất các action và reducer
export const { resetError, setDataLoaded } = gameSlice.actions;
export default gameSlice.reducer;
