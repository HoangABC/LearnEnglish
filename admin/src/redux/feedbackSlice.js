import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../apis/api';

// Async thunks
export const fetchAllFeedbacks = createAsyncThunk(
  'feedback/fetchAllFeedbacks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getAllFeedbacks();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchFeedbackById = createAsyncThunk(
  'feedback/fetchFeedbackById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.getFeedbackById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchFeedbacksByUserId = createAsyncThunk(
  'feedback/fetchFeedbacksByUserId',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.getFeedbacksByUserId(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const respondToFeedback = createAsyncThunk(
  'feedback/respondToFeedback',
  async ({ feedbackId, responseText, adminId }, { rejectWithValue }) => {
    try {
      console.log('Sending to API:', {
        feedbackId,
        responseText,
        adminId
      });

      const response = await api.respondToFeedback({
        feedbackId,
        responseText,
        adminId
      });
      
      console.log('API Response:', response);

      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data);
      return rejectWithValue(error.response?.data || 'Không thể gửi phản hồi');
    }
  }
);

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState: {
    feedbacks: [],
    currentFeedback: null,
    userFeedbacks: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearFeedbacks: (state) => {
      state.feedbacks = [];
      state.currentFeedback = null;
      state.userFeedbacks = [];
      state.error = null;
    },
    addNewFeedback: (state, action) => {
      if (state.feedbacks?.data) {
        const exists = state.feedbacks.data.some(f => f.Id === action.payload.Id);
        if (!exists) {
          state.feedbacks.data = [action.payload, ...state.feedbacks.data];
        }
      }
    },
    updateFeedback: (state, action) => {
      if (state.feedbacks?.data) {
        state.feedbacks.data = state.feedbacks.data.map(feedback =>
          feedback.Id === action.payload.Id ? action.payload : feedback
        );
      }
    },
    setAllFeedbacks: (state, action) => {
      state.feedbacks = {
        success: true,
        data: action.payload
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchAllFeedbacks
      .addCase(fetchAllFeedbacks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        // Đảm bảo dữ liệu unique theo Id
        if (action.payload?.data) {
          const uniqueData = Array.from(
            new Map(action.payload.data.map(item => [item.Id, item])).values()
          );
          state.feedbacks = {
            ...action.payload,
            data: uniqueData
          };
        } else {
          state.feedbacks = action.payload;
        }
      })
      .addCase(fetchAllFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý fetchFeedbackById
      .addCase(fetchFeedbackById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbackById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFeedback = action.payload;
      })
      .addCase(fetchFeedbackById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý fetchFeedbacksByUserId
      .addCase(fetchFeedbacksByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbacksByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.userFeedbacks = action.payload;
      })
      .addCase(fetchFeedbacksByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Thêm cases cho respondToFeedback
      .addCase(respondToFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(respondToFeedback.fulfilled, (state, action) => {
        state.loading = false;
        // Update the feedback status in the state
        if (state.feedbacks?.data) {
          const feedbackIndex = state.feedbacks.data.findIndex(
            feedback => feedback.Id === action.payload.feedbackId
          );
          if (feedbackIndex !== -1) {
            state.feedbacks.data[feedbackIndex] = {
              ...state.feedbacks.data[feedbackIndex],
              Status: 2,
              AdminResponse: action.payload.responseText,
              ResponseDate: new Date().toISOString()
            };
          }
        }
      })
      .addCase(respondToFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearFeedbacks, 
  addNewFeedback, 
  updateFeedback,
  setAllFeedbacks 
} = feedbackSlice.actions;
export default feedbackSlice.reducer;