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
  const mostFavoritedWords = useSelector((state) => state.words.mostFavoritedWords); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const userObj = JSON.parse(user);
          
          if (!favoriteWords.length) {
            const hasNetwork = await fetch('https://www.google.com', { 
              method: 'HEAD',
              mode: 'no-cors',
              timeout: 5000
            }).then(() => true).catch(() => false);

            if (hasNetwork) {
              console.log('Fetching favorite words from server...');
              const response = await dispatch(fetchFavoriteWords(userObj.Id));
              if (response.payload && Array.isArray(response.payload)) {
                await AsyncStorage.setItem(
                  `favoriteWords_${userObj.Id}`,
                  JSON.stringify(response.payload)
                );
                console.log('Favorite words saved to AsyncStorage');
              }
            } else {
              console.log('Loading favorite words from local storage...');
              const offlineData = await AsyncStorage.getItem(`favoriteWords_${userObj.Id}`);
              if (offlineData) {
                const localFavorites = JSON.parse(offlineData);
                dispatch({ 
                  type: 'words/fetchFavoriteWords/fulfilled',
                  payload: localFavorites 
                });
              }
            }
          }

          if (!randomWords.length) {
            await dispatch(fetchRandomWordsByLevel({ 
              levelId: userObj.LevelId,
              userId: userObj.Id 
            }));
          }
          await dispatch(fetchMostFavoritedWordsToday(userObj.LevelId));
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        // Nếu có lỗi, thử load dữ liệu offline
        try {
          const user = await AsyncStorage.getItem('user');
          if (user) {
            const userObj = JSON.parse(user);
            const offlineData = await AsyncStorage.getItem(`favoriteWords_${userObj.Id}`);
            if (offlineData) {
              const localFavorites = JSON.parse(offlineData);
              dispatch({ 
                type: 'words/fetchFavoriteWords/fulfilled',
                payload: localFavorites 
              });
            }
          }
        } catch (offlineError) {
          console.error('Error loading offline data:', offlineError);
        }
      }
    };
    fetchData();
  }, [dispatch, favoriteWords.length, randomWords.length]);

  const handleSearchWord = async (keyword) => {
    await dispatch(searchWord(keyword));
  };

  const handleFetchRandomWordsByLevel = async (levelId) => {
    const user = await AsyncStorage.getItem('user');
    if (user) {
      const userObj = JSON.parse(user);
      await dispatch(fetchRandomWordsByLevel({ 
        levelId: levelId,
        userId: userObj.Id 
      }));
    }
  };

  const handleFetchFavoriteWords = async (userId) => {
    try {
      const response = await dispatch(fetchFavoriteWords(userId));
      
      // Kiểm tra nếu fetch thành công và có dữ liệu
      if (response.payload && Array.isArray(response.payload)) {
        // Lưu vào AsyncStorage
        await AsyncStorage.setItem(
          `favoriteWords_${userId}`,
          JSON.stringify(response.payload)
        );
        console.log('Favorite words saved to AsyncStorage');
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching and saving favorite words:', error);
      throw error;
    }
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