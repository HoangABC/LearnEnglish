import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  searchWord, 
  fetchRandomWordsByLevel, 
  fetchFavoriteWords, 
  getWord, 
  resetError, 
  resetSearchResults, 
  resetRandomWords, 
  toggleFavoriteWord, 
  fetchMostFavoritedWordsToday // Add the new action here
} from '../redux/wordSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useWordActions = () => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.words.status);
  const error = useSelector((state) => state.words.error);
  const searchResults = useSelector((state) => state.words.searchResults);
  const randomWords = useSelector((state) => state.words.randomWords);
  const favoriteWords = useSelector((state) => state.words.favoriteWords);
  const wordDetail = useSelector((state) => state.words.wordDetail);
  const mostFavoritedWords = useSelector((state) => state.words.mostFavoritedWords); // Add mostFavoritedWords to selector

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
        // Fetch most favorited words today for a specific level
        await dispatch(fetchMostFavoritedWordsToday(userObj.LevelId)); // Pass levelId as needed
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

  const handleGetWord = async (wordId) => {
    await dispatch(getWord(wordId));
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
    wordDetail,
    mostFavoritedWords, // Return mostFavoritedWords so you can access it in your component
    handleSearchWord,
    handleFetchRandomWordsByLevel,
    handleFetchFavoriteWords,
    handleToggleFavoriteWord,
    handleGetWord,
    clearError,
    clearSearchResults,
    clearRandomWords,
  };
};

export default useWordActions;
