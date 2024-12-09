import React, { useEffect, useState } from 'react';    
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import useWordActions from '../../hooks/useWordActions';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { mostFavoritedWords } from '../../redux/wordsSlice';

const WordDetail = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const { wordId, isSaved } = route.params;
  const { handleGetWord, wordDetail, handleToggleFavoriteWord } = useWordActions();
  const [userId, setUserId] = useState(null);
  const [isFavorited, setIsFavorited] = useState(isSaved || false);

  const [soundUrl, setSoundUrl] = useState(null);
  const [webviewKey, setWebviewKey] = useState(0);

  const [visibleExamples, setVisibleExamples] = useState({});

  const mostFavoritedWords = useSelector((state) => state.words.mostFavoritedWords);

  useEffect(() => {
    if (wordId) {
      handleGetWord(wordId);
    }
  }, [wordId]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const { Id } = JSON.parse(user);
          setUserId(Id);
          if (wordDetail && wordDetail[0]) {
            setIsFavorited(wordDetail[0].userIds?.includes(Id) || isSaved);
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUserData();
  }, [wordDetail, isSaved]);

  useEffect(() => {
    setIsFavorited(isSaved);
  }, [isSaved]);

  const handleToggleFavorite = async () => {
    if (!userId) return;
    try {
      await handleToggleFavoriteWord(userId, wordId);
      setIsFavorited(!isFavorited);
      
      if (mostFavoritedWords) {
        const updatedWords = mostFavoritedWords.map(word =>
          word.Id === wordId 
            ? { 
                ...word, 
                userIds: !isFavorited
                  ? [...(word.userIds || []), userId]
                  : word.userIds?.filter(id => id !== userId),
                FavoriteCount: !isFavorited
                  ? (word.FavoriteCount || 0) + 1
                  : (word.FavoriteCount || 1) - 1
              }
            : word
        );
        
        dispatch({
          type: 'words/fetchMostFavoritedWordsToday/fulfilled',
          payload: updatedWords
        });
      }

    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const playSound = (audioUrl) => {
    if (!audioUrl) return;
    setSoundUrl(audioUrl);
    setWebviewKey(prevKey => prevKey + 1);
  };

  const formatExamplesWithTranslations = (example, exampleVI, index) => {
    if (!example || !exampleVI) return null;

    const cleanedExample = example.replace(/<\/?li[^>]*>/g, '').replace(/<[^>]+>/g, '');
    const cleanedExampleVI = exampleVI.replace(/<\/?li[^>]*>/g, '').replace(/<[^>]+>/g, '');

    const englishExamples = cleanedExample.split(';').map(e => e.trim());
    const vietnameseExamples = cleanedExampleVI.split(';').map(e => e.trim());

    const pairedExamples = englishExamples.map((example, i) => ({
      english: example,
      vietnamese: vietnameseExamples[i] || ''
    }));

    const currentVisible = visibleExamples[index] || 1;

    return (
      <>
        {pairedExamples.slice(0, currentVisible).map((examplePair, i) => (
          <View key={i} style={styles.examplePair}>
            <View style={styles.exampleRow}>
              <Image source={require('../../assets/images/EN.jpg')} style={styles.flag} />
              <Text style={styles.exampleText}>{examplePair.english}</Text>
            </View>
            <View style={styles.exampleRow}>
              <Image source={require('../../assets/images/VN.png')} style={styles.flag} />
              <Text style={styles.exampleText}>{examplePair.vietnamese}</Text>
            </View>
    
            <View style={styles.divider} />
          </View>
        ))}
        {currentVisible < pairedExamples.length && (
          <TouchableOpacity onPress={() => setVisibleExamples({
            ...visibleExamples,
            [index]: currentVisible + 1
          })}>
            <Text style={styles.showMoreButton}>Xem thêm</Text>
          </TouchableOpacity>
        )}
      </>
    );
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {wordDetail && Array.isArray(wordDetail) ? (
        <View>
          <View style={styles.wordHeader}>
            <Text style={styles.wordText}>
              {capitalizeFirstLetter(wordDetail[0].Word)}
            </Text>
            <TouchableOpacity 
              style={[
                styles.favoriteButton,
                isFavorited ? styles.favorited : styles.notFavorited
              ]}
              onPress={handleToggleFavorite}
            >
              <Text style={[
                styles.favoriteButtonText,
                isFavorited ? styles.favoritedText : styles.notFavoritedText
              ]}>
                {isFavorited ? "ĐÃ LƯU" : "LƯU TỪ"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.phoneticsContainer}>
            <Text style={styles.phoneticText}>UK: {capitalizeFirstLetter(wordDetail[0].PhoneticUK)}</Text>
            <TouchableOpacity onPress={() => playSound(wordDetail[0].AudioUK)}>
              <Text style={styles.audioLink}>🔊 UK Pronunciation</Text>
            </TouchableOpacity>

            <Text style={styles.phoneticText}>US: {capitalizeFirstLetter(wordDetail[0].PhoneticUS)}</Text>
            <TouchableOpacity onPress={() => playSound(wordDetail[0].AudioUS)}>
              <Text style={styles.audioLink}>🔊 US Pronunciation</Text>
            </TouchableOpacity>
          </View>

          {wordDetail.map((word, index) => (
            <View key={index}>
              <Text style={styles.partOfSpeech}>{capitalizeFirstLetter(word.PartOfSpeech)}</Text>
              <Text style={styles.definitionText}>{capitalizeFirstLetter(word.DefinitionVI)}</Text>
              {formatExamplesWithTranslations(word.Example, word.ExampleVI, index)}
            </View>
          ))}
        </View>
      ) : (
        <Text>Loading...</Text>
      )}

      {soundUrl && (
        <View style={{ height: 0 }}>
          <WebView
            key={webviewKey}
            source={{ uri: soundUrl }}
            style={{ height: 0, width: 0, opacity: 0 }}
            onLoad={() => console.log('WebView Loaded')}
            onError={() => console.error('WebView Error')}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  partOfSpeech: {
    fontSize: 20,
    color: '#666',
    fontStyle: 'italic',
    fontWeight: 'bold',        
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  phoneticsContainer: {
    marginBottom: 20,
  },
  phoneticText: {
    fontSize: 18,
    color: '#555',
  },
  audioLink: {
    fontSize: 16,
    color: '#0066cc',
    marginBottom: 10,
  },
  definitionText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  examplePair: {
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'left',
    paddingLeft: 10,
  },
  showMoreButton: {
    fontSize: 16,
    color: '#0066cc',
    marginTop: 10,
    textAlign: 'center',
  },
  flag: {
    width: 24,
    height: 16,
    marginRight: 8,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  favoriteButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  notFavorited: {
    backgroundColor: '#FFC107',
  },

  favorited: {
    backgroundColor: '#4CAF50',
  },

  favoriteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  notFavoritedText: {
    color: '#000',
  },

  favoritedText: {
    color: '#fff',
  },

  savedIndicator: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  
  savedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WordDetail;