import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../apis/api'; // Đảm bảo rằng đường dẫn đúng

// Thunk để thêm từ
export const addWord = createAsyncThunk(
  'words/addWord',
  async (wordData, { rejectWithValue }) => {
    try {
      const response = await api.addWord(wordData);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi thêm từ');
    }
  }
);

const wordSlice = createSlice({
  name: 'words',
  initialState: {
    word: null,
    phoneticUK: '',
    phoneticUS: '',
    audioUK: '',
    audioUS: '',
    example: '',
    error: null,
    status: 'idle',
  },
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addWord.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addWord.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Cập nhật trạng thái với dữ liệu mới
        state.word = action.payload.word;
        state.phoneticUK = action.payload.phoneticUK;
        state.phoneticUS = action.payload.phoneticUS;
        state.audioUK = action.payload.audioUK;
        state.audioUS = action.payload.audioUS;
        state.example = action.payload.example;
        state.error = null;
        console.log('Word added:', action.payload);
      })
      .addCase(addWord.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetError } = wordSlice.actions;
export default wordSlice.reducer;
