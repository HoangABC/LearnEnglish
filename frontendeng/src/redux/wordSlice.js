import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../apis/api';

// Thunk action creator để tìm kiếm từ
export const searchWord = createAsyncThunk(
  'words/searchWord',
  async (keyword, { rejectWithValue }) => {
    try {
      const response = await api.searchWord(keyword);
      const results = response.data;

      if (results.length === 0) {
        return rejectWithValue('Không có kết quả tìm kiếm');
      }

      return results;
    } catch (error) {
      if (error.response) {
        // Xử lý lỗi từ backend
        if (error.response.status === 404) {
          return rejectWithValue('Từ khóa không hợp lệ hoặc không có kết quả tìm kiếm');
        }
        return rejectWithValue(error.response.data.message || 'Có lỗi xảy ra khi tìm kiếm từ');
      } else if (error.request) {
        // Xử lý lỗi không nhận được phản hồi từ backend
        return rejectWithValue('Không thể kết nối tới máy chủ');
      } else {
        // Xử lý lỗi khác
        return rejectWithValue('Có lỗi xảy ra khi tìm kiếm từ');
      }
    }
  }
);

const wordSlice = createSlice({
  name: 'words',
  initialState: {
    searchResults: [],
    error: null,
    status: 'idle',
  },
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    resetSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchWord.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchWord.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.searchResults = action.payload;
        state.error = null;
      })
      .addCase(searchWord.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.searchResults = [];
      });
  },
});

export const { resetError, resetSearchResults } = wordSlice.actions;
export default wordSlice.reducer;
