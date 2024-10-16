import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'; 
import { api } from '../apis/api';

// Tạo asyncThunk để lấy danh sách bài kiểm tra (quiz)
export const fetchTests = createAsyncThunk(
  'tests/fetchTests',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.fetchTests(userId); // Gọi API để lấy bài kiểm tra
      return response.data; // Trả về dữ liệu nếu thành công
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : 'Network error'); // Trả về lỗi nếu có
    }
  }
);

// Tạo asyncThunk để nộp bài kiểm tra (quiz)
export const submitQuiz = createAsyncThunk(
  'tests/submitQuiz',
  async ({ userId, answers }, { rejectWithValue }) => {
    try {
      const response = await api.submitQuiz(userId, answers);
      console.log("API Response:", response);  // Log phản hồi từ API
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      return rejectWithValue(error.response ? error.response.data : 'Network error');
    }
  }
);

const testSlice = createSlice({
  name: 'tests',
  initialState: {
    tests: [],       // Lưu trữ danh sách câu hỏi
    score: 0,        // Điểm bài kiểm tra
    totalQuestions: 0,  // Tổng số câu hỏi trong bài
    newLevelId: null, // Thêm newLevelId
    loading: false,   // Trạng thái đang tải
    error: null,      // Lưu lỗi nếu có
  },
  reducers: {
    resetQuiz: (state) => {
      state.tests = [];
      state.score = 0;
      state.totalQuestions = 0;
      state.newLevelId = null; // Reset newLevelId
      state.loading = false;
      state.error = null;
    },
    setNewLevelId: (state, action) => {
      state.newLevelId = action.payload; // Cập nhật newLevelId
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTests.pending, (state) => {
        state.loading = true; // Đang tải dữ liệu
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.loading = false; // Dừng tải dữ liệu
        state.tests = action.payload; // Lưu danh sách câu hỏi
        state.totalQuestions = action.payload.length; // Cập nhật tổng số câu hỏi
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.loading = false; // Dừng tải dữ liệu
        state.error = action.payload; // Lưu lỗi nếu có
      })
      .addCase(submitQuiz.pending, (state) => {
        state.loading = true; // Đang nộp bài
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.loading = false; // Dừng nộp bài
        state.score = action.payload.score; // Cập nhật điểm số
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.loading = false; // Dừng nộp bài
        state.error = action.payload; // Lưu lỗi nếu có
      });
  },
});

export const { resetQuiz, setNewLevelId } = testSlice.actions; // Xuất action
export default testSlice.reducer; // Xuất reducer
