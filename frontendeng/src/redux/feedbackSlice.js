import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../apis/api';

// Async thunk actions
export const createFeedback = createAsyncThunk(
  'feedback/createFeedback',
  async ({ userId, feedbackText }, { rejectWithValue }) => {
    try {
      const response = await api.createFeedback(userId, feedbackText);
      console.log('API Response:', response);
      if (response.status === 201 || response.status === 200) {
        return response.data;
      }
      return rejectWithValue('Failed to create feedback');
    } catch (error) {
      console.error('API Error:', error);
      return rejectWithValue(error.response?.data || 'Failed to create feedback');
    }
  }
);

export const getFeedbacks = createAsyncThunk(
  'feedback/getFeedbacks',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.getFeedbacks(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch feedbacks');
    }
  }
);

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState: {
    feedbacks: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearFeedbackError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Feedback
      .addCase(createFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          if (!Array.isArray(state.feedbacks)) {
            state.feedbacks = [];
          }
          state.feedbacks.push(action.payload);
        }
      })
      .addCase(createFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Feedbacks
      .addCase(getFeedbacks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks = action.payload;
      })
      .addCase(getFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFeedbackError } = feedbackSlice.actions;
export default feedbackSlice.reducer; 