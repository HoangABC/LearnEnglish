import { configureStore } from '@reduxjs/toolkit';
import wordReducer from './wordSlice';

const store = configureStore({
  reducer: {
    words: wordReducer,
  },
});

export default store;
