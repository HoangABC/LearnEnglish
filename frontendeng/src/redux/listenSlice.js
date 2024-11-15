import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../apis/api';

// Thunk to fetch listening practice questions
export const fetchListeningPractice = createAsyncThunk(
  'listen/fetchListeningPractice',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.fetchListeningPractice(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk to submit listening practice answers
export const submitListeningPractice = createAsyncThunk(
  'listen/submitListeningPractice',
  async ({ userId, questionId, answer }, { rejectWithValue }) => { 
    try {
      const response = await api.submitListeningPractice(userId, { questionId, answer });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const listenSlice = createSlice({
  name: 'listen',
  initialState: {
    listeningPracticeData: null,
    isLoading: false,
    error: null,
    submitSuccess: null,
  },
  reducers: {
    resetSubmitSuccess: (state) => {
      state.submitSuccess = null;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchListeningPractice
    builder
      .addCase(fetchListeningPractice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchListeningPractice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listeningPracticeData = action.payload;
        // Log the data after it is fetched
        console.log('Fetched Listening Practice Data:', action.payload);
      })
      .addCase(fetchListeningPractice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Handle submitListeningPractice
      .addCase(submitListeningPractice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitListeningPractice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submitSuccess = true;
        // Log the data returned after the answer is submitted
        console.log('Submitted Listening Practice Data:', action.payload);
      })
      .addCase(submitListeningPractice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetSubmitSuccess } = listenSlice.actions;
export default listenSlice.reducer;
