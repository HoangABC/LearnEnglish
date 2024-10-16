import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  searchWord, 
  fetchRandomWordsByLevel, 
  fetchFavoriteWords, 
  resetError, 
  resetSearchResults, 
  resetRandomWords, 
  toggleFavoriteWord 
} from '../redux/wordSlice';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Thay đổi theo thư viện bạn sử dụng

const useWordActions = () => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.words.status);
  const error = useSelector((state) => state.words.error);
  const searchResults = useSelector((state) => state.words.searchResults);
  const randomWords = useSelector((state) => state.words.randomWords);
  const favoriteWords = useSelector((state) => state.words.favoriteWords);

  useEffect(() => {
    const fetchData = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userObj = JSON.parse(user);
        if (!favoriteWords.length) {
          await dispatch(fetchFavoriteWords(userObj.Id));
        }
        if (!randomWords.length) {
          await dispatch(fetchRandomWordsByLevel(userObj.LevelId));
        }
      }
    };
    fetchData();
  }, [dispatch, favoriteWords.length, randomWords.length]);

  const handleSearchWord = async (keyword) => {
    await dispatch(searchWord(keyword));
  };

  const handleFetchRandomWordsByLevel = async (levelId) => {
    await dispatch(fetchRandomWordsByLevel(levelId));
  };

  const handleFetchFavoriteWords = async (userId) => {
    await dispatch(fetchFavoriteWords(userId));
  };

  const handleToggleFavoriteWord = async (userId, wordId) => {
    await dispatch(toggleFavoriteWord({ userId, wordId }));
  };

  const clearError = () => {
    dispatch(resetError());
  };

  const clearSearchResults = () => {
    dispatch(resetSearchResults());
  };

  const clearRandomWords = () => {
    dispatch(resetRandomWords());
  };

  return {
    status,
    error,
    searchResults,
    randomWords,
    favoriteWords,
    handleSearchWord,
    handleFetchRandomWordsByLevel,
    handleFetchFavoriteWords,
    handleToggleFavoriteWord,
    clearError,
    clearSearchResults,
    clearRandomWords,
  };
};

export default useWordActions;
