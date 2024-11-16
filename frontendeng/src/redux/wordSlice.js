import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../apis/api'; // Ensure apiClient has fetchMostFavoritedWordsToday

// Error handler
const handleError = (error, defaultMessage) => {
  if (error.response) {
    return error.response.data.message || defaultMessage;
  } else if (error.request) {
    return 'No response from server';
  } else {
    return 'Error: ' + error.message;
  }
};

// Thunk for searching a word
export const searchWord = createAsyncThunk(
  'words/searchWord',
  async (keyword, { rejectWithValue }) => {
    try {
      const response = await api.searchWord(keyword);
      const results = response.data;
      if (results.length === 0) {
        return rejectWithValue('No search results');
      }
      return results;
    } catch (error) {
      return rejectWithValue(handleError(error, 'An error occurred while searching for the word'));
    }
  }
);

// Thunk for fetching random words by level
export const fetchRandomWordsByLevel = createAsyncThunk(
  'words/fetchRandomWordsByLevel',
  async (levelId, { rejectWithValue }) => {
    try {
      const response = await api.fetchRandomWordsByLevel(levelId);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      return rejectWithValue(handleError(error, 'An error occurred while fetching random words'));
    }
  }
);

// Thunk for fetching word by ID
export const getWord = createAsyncThunk(
  'words/getWord',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.getWord(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleError(error, 'An error occurred while fetching the word by ID'));
    }
  }
);

// Thunk for toggling favorite word
export const toggleFavoriteWord = createAsyncThunk(
  'words/toggleFavoriteWord',
  async ({ userId, wordId }, { rejectWithValue }) => {
    try {
      const response = await api.toggleFavoriteWord(userId, wordId);
      return response.data;
    } catch (error) {
      return rejectWithValue(handleError(error, 'An error occurred while toggling the favorite word'));
    }
  }
);

// Thunk for fetching favorite words
export const fetchFavoriteWords = createAsyncThunk(
  'words/fetchFavoriteWords',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.fetchFavoriteWords(userId);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      return rejectWithValue(handleError(error, 'An error occurred while fetching favorite words'));
    }
  }
);

// Thunk for fetching most favorited words today
export const fetchMostFavoritedWordsToday = createAsyncThunk(
  'words/fetchMostFavoritedWordsToday',
  async (levelId, { rejectWithValue }) => {
    try {
      const response = await api.fetchMostFavoritedWordsToday(levelId);
      return response.data; // Expecting an array of most favorited words
    } catch (error) {
      return rejectWithValue(handleError(error, 'An error occurred while fetching most favorited words today'));
    }
  }
);

const initialState = {
  searchResults: [],
  randomWords: [],
  favoriteWords: [],
  wordDetail: null,
  mostFavoritedWords: [], 
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
    resetMostFavoritedWords: (state) => {
      state.mostFavoritedWords = [];
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

      .addCase(getWord.pending, handlePending)
      .addCase(getWord.fulfilled, (state, action) => {
        handleFulfilled(state, action);
        state.wordDetail = action.payload;
      })
      .addCase(getWord.rejected, handleRejected)

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
      .addCase(fetchFavoriteWords.rejected, handleRejected)

      // Handling most favorited words today
      .addCase(fetchMostFavoritedWordsToday.pending, handlePending)
      .addCase(fetchMostFavoritedWordsToday.fulfilled, (state, action) => {
        handleFulfilled(state, action);
        state.mostFavoritedWords = action.payload;
       
      })
      .addCase(fetchMostFavoritedWordsToday.rejected, handleRejected);
  },
});

export const {
  resetError,
  resetSearchResults,
  resetRandomWords,
  resetFavoriteWords,
  setDataLoaded,
  resetMostFavoritedWords,
} = wordSlice.actions;

export default wordSlice.reducer;
