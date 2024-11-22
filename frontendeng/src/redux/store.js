import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import wordReducer from './wordSlice';
import testReducer from './testSlice';
import gameReducer from './gameSlice'; 
import listenReducer from './listenSlice'; 
import feedbackReducer from './feedbackSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    words: wordReducer,
    tests: testReducer,
    games: gameReducer,
    listen: listenReducer, 
    feedback: feedbackReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
      immutableCheck: false, 
    }),
});

export default store;
