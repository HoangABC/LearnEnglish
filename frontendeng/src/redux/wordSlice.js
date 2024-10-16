import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../apis/api';
import debounce from 'lodash/debounce';

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

// Thunk để tìm kiếm từ
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
      return rejectWithValue(handleError(error, 'Có lỗi xảy ra khi tìm kiếm từ'));
    }
  }
);

// Thunk để lấy từ ngẫu nhiên theo level
export const fetchRandomWordsByLevel = createAsyncThunk(
  'words/fetchRandomWordsByLevel',
  async (levelId, { rejectWithValue }) => {
    console.log('fetchRandomWordsByLevel API called with levelId:', levelId); // Log API call
    try {
      const response = await api.fetchRandomWordsByLevel(levelId);
      console.log(response)
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      return rejectWithValue(handleError(error, 'Có lỗi xảy ra khi lấy từ ngẫu nhiên'));
    }
  }
);


// Thunk để thay đổi trạng thái yêu thích của từ
export const toggleFavoriteWord = createAsyncThunk(
  'words/toggleFavoriteWord',
  async ({ userId, wordId }, { rejectWithValue }) => {
    try {
      const response = await api.toggleFavoriteWord(userId, wordId);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleError(error, 'Có lỗi xảy ra khi thay đổi trạng thái yêu thích'));
    }
  }
);

// Thunk để lấy danh sách từ yêu thích
export const fetchFavoriteWords = createAsyncThunk(
  'words/fetchFavoriteWords',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.fetchFavoriteWords(userId);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      return rejectWithValue(handleError(error, 'Có lỗi xảy ra khi lấy danh sách từ yêu thích'));
    }
  }
);

const initialState = {
  searchResults: [],
  randomWords: [],
  favoriteWords: [],
  error: null,
  status: 'idle',
  dataLoaded: false,
};

const wordSlice = createSlice({
  name: 'words',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    resetSearchResults: (state) => {
      state.searchResults = [];
    },
    resetRandomWords: (state) => {
      state.randomWords = [];
    },
    resetFavoriteWords: (state) => {
      state.favoriteWords = [];
    },
    setDataLoaded: (state, action) => {
      state.dataLoaded = action.payload;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.status = 'loading';
    };
    const handleFulfilled = (state, action) => {
      state.status = 'succeeded';
      state.error = null;
    };
    const handleRejected = (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    };

    builder
      .addCase(searchWord.pending, handlePending)
      .addCase(searchWord.fulfilled, (state, action) => {
        handleFulfilled(state, action);
        state.searchResults = action.payload;
        state.dataLoaded = true;
      })
      .addCase(searchWord.rejected, handleRejected)
      .addCase(fetchRandomWordsByLevel.pending, handlePending)
      .addCase(fetchRandomWordsByLevel.fulfilled, (state, action) => {
        handleFulfilled(state, action);
        state.randomWords = action.payload;
      })
      .addCase(fetchRandomWordsByLevel.rejected, handleRejected)
      .addCase(toggleFavoriteWord.pending, handlePending)
      .addCase(toggleFavoriteWord.fulfilled, (state, action) => {
        handleFulfilled(state, action);
        const toggledWord = action.payload;
        if (toggledWord.isFavorite) {
          state.favoriteWords.push(toggledWord);
        } else {
          state.favoriteWords = state.favoriteWords.filter(word => word.id !== toggledWord.id);
        }
      })
      .addCase(toggleFavoriteWord.rejected, handleRejected)
      .addCase(fetchFavoriteWords.pending, handlePending)
      .addCase(fetchFavoriteWords.fulfilled, (state, action) => {
        handleFulfilled(state, action);
        state.favoriteWords = action.payload;
      })
      .addCase(fetchFavoriteWords.rejected, handleRejected);
  },
});

export const { resetError, resetSearchResults, resetRandomWords, resetFavoriteWords, setDataLoaded } = wordSlice.actions;

export default wordSlice.reducer;
