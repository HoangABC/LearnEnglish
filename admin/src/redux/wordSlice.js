import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../apis/api';

// Thêm tham số `page` và `pageSize` trong thunk
export const fetchWordsStatus1 = createAsyncThunk('words/fetchWordsStatus1', async ({ page, pageSize }) => {
    const response = await api.getWordsStatus1(page, pageSize);
    return response.data;
  });
  
  export const fetchWordsStatus0 = createAsyncThunk('words/fetchWordsStatus0', async ({ page, pageSize }) => {
    const response = await api.getWordsStatus0(page, pageSize);
    return response.data;
  });
  

// Thunk để cập nhật trạng thái của từ
export const updateWordStatus = createAsyncThunk('words/updateWordStatus', async ({ id, newStatus }) => {
  await api.updateWordStatus(id, newStatus);
  return { id, newStatus }; // Trả về id và trạng thái mới để cập nhật state
});

const wordSlice = createSlice({
  name: 'words',
  initialState: {
    status1: [],
    status0: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWordsStatus1.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWordsStatus1.fulfilled, (state, action) => {
        console.log('Words status 1 updated in Redux:', action.payload);
        state.status1 = action.payload;
        state.loading = false;
      })
      .addCase(fetchWordsStatus1.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchWordsStatus0.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWordsStatus0.fulfilled, (state, action) => {
        console.log('Words status 0 updated in Redux:', action.payload);
        state.status0 = action.payload;
        state.loading = false;
      })
      .addCase(fetchWordsStatus0.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateWordStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWordStatus.fulfilled, (state, action) => {
        const { id, newStatus } = action.payload;

        // Cập nhật trạng thái ngay lập tức mà không cần gọi lại API
        const updateStatus = (statusArray) => {
          return statusArray
            .filter(word => word.Id !== id)
            .concat({
              Id: id,
              Status: newStatus,
              // Thêm các thuộc tính khác nếu cần
            });
        };

        if (newStatus === 1) {
          state.status1 = updateStatus(state.status1);
        } else if (newStatus === 0) {
          state.status0 = updateStatus(state.status0);
        }

        state.loading = false;
      })
      .addCase(updateWordStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default wordSlice.reducer;
