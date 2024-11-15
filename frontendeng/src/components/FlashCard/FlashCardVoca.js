import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, Dimensions, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import useWordActions from '../../hooks/useWordActions';
import FlipCard from 'react-native-flip-card';
import { Appbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

const FlashCardVoca = ({ route }) => {
  const { randomWords, handleFetchRandomWordsByLevel, handleToggleFavoriteWord, handleFetchFavoriteWords } = useWordActions();
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const [levelId, setLevelId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [wordsArray, setWordsArray] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [favoriteWords, setFavoriteWords] = useState([]);
  const [soundUrl, setSoundUrl] = useState(null);
  const [isWebViewVisible, setWebViewVisible] = useState(false);
  const [webviewKey, setWebviewKey] = useState(0);

  const dataFetched = useRef(false);
  const wordsArrayRef = useRef([]);
  const [autoPlay, setAutoPlay] = useState(false); 
  const [soundRegion, setSoundRegion] = useState('UK'); 
  
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const userObj = JSON.parse(user);
          setUserId(userObj.Id);
        }
      } catch (error) {
        console.error('Failed to load userId:', error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchWords = async () => {
        try {
          await handleFetchFavoriteWords(userId);
        } catch (error) {
          console.error('Failed to fetch words:', error);
        }
      };
      fetchWords();
    }
  }, [userId]);

  useEffect(() => {
    const fetchAutoPlaySettings = async () => {
      try {
        const autoPlaySound = await AsyncStorage.getItem('autoPlaySound');
        if (autoPlaySound) {
          const { isEnabled, region } = JSON.parse(autoPlaySound);
          setAutoPlay(isEnabled);
          setSoundRegion(region); // region là US hoặc UK
        }
      } catch (error) {
        console.error('Failed to load autoPlaySound settings:', error);
      }
    };
  
    fetchAutoPlaySettings();
  }, []);
  

  const fetchWordsFromStorage = useCallback(async () => {
    try {
      const [wordsJson, userJson] = await Promise.all([
        AsyncStorage.getItem(`wordsArray_${userId}`), // Sử dụng userId để lấy từ khóa khác nhau
        AsyncStorage.getItem('user')
      ]);

      if (userJson) {
        const userData = JSON.parse(userJson);
        setUser(userData);
        if (userData.LevelId) {
          setLevelId(userData.LevelId);
        }
      }

      if (wordsJson) {
        const storedWords = JSON.parse(wordsJson);
        setWordsArray(storedWords || []);
        wordsArrayRef.current = storedWords || [];
        setIsLoaded(true);
        setCurrentCardIndex(0);
      } else {
        // Nếu không có từ khóa trong bộ nhớ, hãy gọi để lấy từ khóa
        fetchWords();
      }
    } catch (error) {
      console.error('Failed to load data from AsyncStorage:', error);
      fetchWords();
    }
  }, [fetchWords, userId]);

  const fetchWords = useCallback(async () => {
    if (dataFetched.current) return;

    if (!levelId) {
      setIsLoaded(false);
      return;
    }

    try {
      await handleFetchRandomWordsByLevel(levelId);
      const fetchedFavorites = await handleFetchFavoriteWords(userId);
      const favorites = Array.isArray(fetchedFavorites) ? fetchedFavorites : [];

      const wordsWithFavorites = randomWords.map(word => ({
        ...word,
        userId, 
        isFavorite: favorites.some(favWord => favWord.Id === word.Id)
      }));

      setWordsArray(wordsWithFavorites);
      wordsArrayRef.current = wordsWithFavorites;
      await AsyncStorage.setItem(`wordsArray_${userId}`, JSON.stringify(wordsWithFavorites)); // Lưu từ khóa khác nhau cho từng tài khoản
    } catch (error) {
      setIsLoaded(false);
      console.error('Failed to fetch words:', error);
    }

    dataFetched.current = true;
  }, [handleFetchRandomWordsByLevel, handleFetchFavoriteWords, randomWords, levelId, userId]);

  useEffect(() => {
    fetchWordsFromStorage();
  }, [fetchWordsFromStorage]);

  const handleFetchWords = useCallback(async () => {
    if (!levelId) {
      console.error('Level ID is not set.');
      return;
    }
    await fetchWords(); // Gọi hàm fetchWords khi người dùng yêu cầu
  }, [fetchWords, levelId]);

  const handleToggleFavorite = useCallback(async (wordId) => {
    if (!userId) {
      console.error('User not found');
      return;
    }

    const updatedWordsArray = wordsArray.map(word =>
      word.Id === wordId ? { ...word, isFavorite: !word.isFavorite } : word
    );

    try {
      await handleToggleFavoriteWord(userId, wordId);
      setWordsArray(updatedWordsArray);
      wordsArrayRef.current = updatedWordsArray;
      await AsyncStorage.setItem(`wordsArray_${userId}`, JSON.stringify(updatedWordsArray)); // Cập nhật danh sách từ khóa
    } catch (error) {
      console.error('Failed to update favorite status:', error);
    }
  }, [wordsArray, handleToggleFavoriteWord, userId]);

  const formatDefinition = (definition) => {
    if (!definition) return null;
    const cleanedDefinition = definition.replace(/^- +/, '').trim();
    const parts = cleanedDefinition.split(' - ').map(part => part.trim()).slice(0, 2);

    return (
      <>
        {parts.map((part, index) => (
          <Text key={index} style={styles.definition}>
            {'- '}{part.includes('<') && part.includes('>') 
              ? part.split(/(<.*?>)/g).map((subPart, subIndex) => (
                  subPart.startsWith('<') && subPart.endsWith('>') ? (
                    <Text key={subIndex} style={styles.definitionBold}>{subPart}</Text>
                  ) : (
                    <Text key={subIndex}>{subPart}</Text>
                  )
                ))
              : part}
          </Text>
        ))}
      </>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.flipCardContainer}>
      <FlipCard
        key={item.Id}
        style={[styles.flipCard, { zIndex: 10 }]}
        friction={8}
        perspective={1000}
        flipHorizontal
        flipVertical={false}
      >
      <LinearGradient 
        colors={['#353A5F', '#9EBAF3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardFront}
      >
        <TouchableOpacity
          style={styles.favoriteIcon}
          onPress={() => handleToggleFavorite(item.Id)}
        >
          <Icon
            name={item.isFavorite ? 'star' : 'star-border'}
            size={24}
            color={item.isFavorite ? 'yellow' : 'white'}
          />
        </TouchableOpacity>

        <Text style={styles.word}>{item.Word}</Text>

        <View style={styles.phoneticContainer}>

          <View style={styles.phoneticItem}>
            <Text style={styles.phoneticText}>UK</Text>
            <TouchableOpacity
              style={styles.soundIcon}
              onPress={() => playSound(item.AudioUK)}
            >
              <Icon name="volume-up" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.phonetic}>{item.PhoneticUK}</Text>
          </View>

          <View style={styles.phoneticItem}>
            <Text style={styles.phoneticText}>US</Text>
            <TouchableOpacity
              style={styles.soundIcon}
              onPress={() => playSound(item.AudioUS)}
            >
              <Icon name="volume-up" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.phonetic}>{item.PhoneticUS}</Text>
          </View>
        </View>
      </LinearGradient>
        <View style={styles.cardBack}>
          <View style={styles.tes}>
            <Text style={styles.title}>Định nghĩa:</Text>
            {formatDefinition(item.Definition)}
            <Text style={styles.title}>Định nghĩa VI:</Text>
            {formatDefinition(item.DefinitionVI)}
            <Text style={styles.title}>Ví dụ:</Text>
            <ScrollView style={styles.scrollView}>
              <Text style={styles.example}>
                {item.Example.replace(/<\/?li[^>]*>/g, '').replace(/<[^>]+>/g, '').split(';')[0]}
              </Text>
              <Text style={styles.title}>Ví dụ VI:</Text>
              <Text style={styles.example}>
                {item.ExampleVI.replace(/<\/?li[^>]*>/g, '').replace(/<[^>]+>/g, '').split(';')[0]}
              </Text>
            </ScrollView>
          </View>
        </View>
      </FlipCard>
    </View>
  );
  

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / (width * 0.9));
    setCurrentCardIndex(currentIndex);
  
    const currentWord = wordsArray[currentIndex];
  
    // Nếu tự động phát âm thanh được bật và có từ
    if (autoPlay && currentWord) {
      const soundUrl = soundRegion === 'US' ? currentWord.AudioUS : currentWord.AudioUK;
      if (soundUrl) {
        playSound(soundUrl);
      }
    }
  };


  const playSound = (audioUrl) => {
    if (!audioUrl) return;
  
    // Đổi soundUrl và reset WebView
    setSoundUrl(audioUrl);
    setWebviewKey(prevKey => prevKey + 1);
  };

const wordsArrayLength = favoriteWords.length;
  return (
    <ImageBackground
      source={require('../../assets/images/background_flashcard.jpg')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content
            title={(
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  {currentCardIndex + 1}/{wordsArray.length}
                </Text>
              </View>
            )}
          />
        </Appbar.Header>
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${((currentCardIndex + 1) / (wordsArray.length || 1)) * 100}%` }
              ]}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={fetchWords}>
          <Text style={styles.refreshButtonText}>Làm mới</Text>
        </TouchableOpacity>
  
        <View style={styles.flashCardContainer}>
          <FlatList
            data={wordsArray}
            renderItem={renderItem}
            keyExtractor={(item) => item.Id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            onScroll={handleScroll}
            contentContainerStyle={styles.flatListContentContainer} 
            snapToInterval={width * 0.9} 
            decelerationRate="fast" 
            snapToAlignment="center" 
          />
        </View>

        {soundUrl && (
          <View style={{ height: 0 }}>
            <WebView
              key={webviewKey} 
              source={{ uri: soundUrl }} 
              style={{ height: 0, width: 0, opacity: 0 }} 
              onLoad={() => console.log('WebView Loaded')}
              onError={() => {
                console.error('WebView Error');
              }}
            />
          </View>
        )}

      </View>
    </ImageBackground>
  );
  
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    width: '100%',
    backgroundColor: '#fff',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: 'black',
  },
  progressBarWrapper: {
    width: '100%',
    paddingHorizontal: 0,
    paddingBottom: 10,
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 5,
    backgroundColor: '#ddd',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'red',
  },
  flipCardContainer: {
    justifyContent: 'center', 
    alignItems: 'center', 
    width: width * 0.9, 
    height: '100%', 
  },
  flipCard: {
    marginStart:9,
    height: 500,
    width: width * 0.8,
  },
  cardFront: {
    borderRadius: 8,
    padding: 15,
    justifyContent: 'center',
    height: 500,
    width: '100%',
    overflow: 'hidden',
  },
  cardBack: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    justifyContent: 'center',
    height: 500,
    width: '100%',
    overflow: 'hidden',
  },
  word: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
    textAlign: 'center',
    flexShrink: 1,
  },
  phonetic: {
    fontSize: 20,
    color: '#eee',
    marginBottom: 10,
    textAlign: 'center',
    flexShrink: 1,
    width:'100%',
  },
  definition: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    textAlign: 'left',
    flexShrink: 1,
  },
  example: {
    fontSize: 14,
    color: '#777',
    textAlign: 'left',
    flexShrink: 1,
  },
  scrollView: {
    width: '100%',
  },
  noData: {
    fontSize: 18,
    color: '#888',
  },
  refreshButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  flashCardContainer: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold', 
    textAlign: 'left', 
    marginBottom: 10,
    color: '#555',
  },
  tes: {
    justifyContent: 'center',
  },
  load: {
    flex: 1,
  },
  definitionVI: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    textAlign: 'left',
    flexShrink: 1,
    fontStyle: 'italic',
  },
  soundIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10, 
    width:'100%',
  },
  phoneticContainer: {
    flexDirection: 'column', 
    justifyContent: 'flex-start', 
    alignItems: 'center',  
    marginBottom: 10,
    width:'100%'
  },
  phoneticItem: {
    flexDirection: 'row',  
    alignItems: 'center',  
    justifyContent: 'center',
    marginBottom: 10,  
  },
  phoneticText: {
    fontSize: 16,
    color: 'white',
    marginRight: 5,
  },
  soundIcon: {
    marginHorizontal: 10,
    alignItems: 'center',
  },
  phonetic: {
    fontSize: 20,
    color: 'white',
    width:100
  },

});

export default FlashCardVoca;