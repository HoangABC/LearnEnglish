import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import wordReducer from './wordSlice';
import testReducer from './testSlice';
import gameReducer from './gameSlice'; 
import listenReducer from './listenSlice'; 

const store = configureStore({
  reducer: {
    auth: authReducer,
    words: wordReducer,
    tests: testReducer,
    games: gameReducer,
    listen: listenReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

export default store;
