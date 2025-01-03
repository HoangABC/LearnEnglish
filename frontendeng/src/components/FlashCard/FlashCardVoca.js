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

const FlashCard = React.memo(({ item, index, handleToggleFavorite, playSound, soundRegion, exampleTexts }) => (
  <View style={styles.flipCardContainer}>
    <FlipCard
      key={item.Id}
      style={styles.flipCard}
      friction={8}
      perspective={1000}
      flipHorizontal={true}
      flipVertical={false}
    >
      <LinearGradient
        colors={['#2C3E50', '#3498DB']}
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
            color={item.isFavorite ? '#FFD700' : '#E0E0E0'}
          />
        </TouchableOpacity>
        <Text style={styles.word}>{item.Word}</Text>

        <View style={styles.phoneticContainer}>
          <View style={styles.phoneticItem}>
            <View style={styles.regionContainer}>
              <Text style={styles.phoneticText}>UK</Text>
              <TouchableOpacity
                style={styles.soundButton}
                onPress={() => playSound(item.AudioUK)}
              >
                <Icon name="volume-up" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.phonetic}>{item.PhoneticUK}</Text>
          </View>

          <View style={styles.phoneticItem}>
            <View style={styles.regionContainer}>
              <Text style={styles.phoneticText}>US</Text>
              <TouchableOpacity
                style={styles.soundButton}
                onPress={() => playSound(item.AudioUS)}
              >
                <Icon name="volume-up" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.phonetic}>{item.PhoneticUS}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.cardBack}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.sectionTitle}>Definition:</Text>
          <Text style={styles.definitionText}>
            - {item.Definition?.replace(/<[^>]+>/g, '')}
          </Text>
          
          <Text style={styles.sectionTitle}>Vietnamese Definition:</Text>
          <Text style={styles.definitionText}>
            - {item.DefinitionVI?.replace(/<[^>]+>/g, '')}
          </Text>
          
          <Text style={styles.sectionTitle}>Example:</Text>
          <Text style={styles.exampleText}>{exampleTexts[index]?.en}</Text>
          
          <Text style={styles.sectionTitle}>Vietnamese Example:</Text>
          <Text style={styles.exampleText}>{exampleTexts[index]?.vi}</Text>
        </ScrollView>
      </View>
    </FlipCard>
  </View>
));

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
  const [exampleTexts, setExampleTexts] = useState([]);
  const dataFetched = useRef(false);
  const wordsArrayRef = useRef([]);
  const [autoPlay, setAutoPlay] = useState(false); 
  const [soundRegion, setSoundRegion] = useState('UK'); 
  const [playedCards, setPlayedCards] = useState(new Set());
  const [scrollDirection, setScrollDirection] = useState(null);
  const lastOffset = useRef(0);
  
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
    if (wordsArray.length) {
      const processedTexts = wordsArray.map(word => {
        const examples = {
          en: word.Example || 'No example available',
          vi: word.ExampleVI || 'Không có ví dụ'
        };
        
        return {
          en: examples.en
            .replace(/<\/?li[^>]*>/g, '')  
            .replace(/<[^>]+>/g, '')      
            .split(';')                    
            .filter(Boolean)              
            .map(item => `- ${item.trim()}`)  
            .join('\n'),                 
          vi: examples.vi
            .replace(/<\/?li[^>]*>/g, '')
            .replace(/<[^>]+>/g, '')
            .split(';')
            .filter(Boolean)
            .map(item => `- ${item.trim()}`)
            .join('\n')
        };
      });
      setExampleTexts(processedTexts);
    }
  }, [wordsArray]);

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
        AsyncStorage.getItem(`wordsArray_${userId}`), 
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
        
        fetchWords();
      }
    } catch (error) {
      console.error('Failed to load data from AsyncStorage:', error);
      fetchWords();
    }
  }, [fetchWords, userId]);

  const fetchWords = useCallback(async () => {
    if (dataFetched.current) return;

    if (!levelId || !userId) {
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
      setPlayedCards(new Set());
      setScrollDirection(null);
      lastOffset.current = 0;
      await AsyncStorage.setItem(`wordsArray_${userId}`, JSON.stringify(wordsWithFavorites)); 
    } catch (error) {
      setIsLoaded(false);
      console.error('Failed to fetch words:', error);
    }

    dataFetched.current = true;
  }, [handleFetchRandomWordsByLevel, handleFetchFavoriteWords, randomWords, levelId, userId]);

  useEffect(() => {
    fetchWordsFromStorage();
  }, [fetchWordsFromStorage]);


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
      await AsyncStorage.setItem(`wordsArray_${userId}`, JSON.stringify(updatedWordsArray));
      console.log('abcs',updatedWordsArray)
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

  const renderItem = useCallback(({ item, index }) => (
    <FlashCard
      item={item}
      index={index}
      handleToggleFavorite={handleToggleFavorite}
      playSound={playSound}
      soundRegion={soundRegion}
      exampleTexts={exampleTexts}
    />
  ), [handleToggleFavorite, playSound, soundRegion, exampleTexts]);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / (width * 0.9));
    
    const currentDirection = offsetX > lastOffset.current ? 'forward' : 'backward';
    
    if (currentDirection !== scrollDirection) {
      setScrollDirection(currentDirection);
      setPlayedCards(new Set());
    }
    
    lastOffset.current = offsetX;
    
    const safeIndex = Math.min(newIndex, wordsArray.length - 1);
    
    if (
      (currentCardIndex === wordsArray.length - 1 && safeIndex === 0) ||
      (currentCardIndex === 0 && safeIndex === wordsArray.length - 1)
    ) {
      setPlayedCards(new Set());
    }
    
    if (safeIndex !== currentCardIndex) {
      setCurrentCardIndex(safeIndex);
      
      if (autoPlay && !playedCards.has(safeIndex)) {
        const currentWord = wordsArray[safeIndex];
        if (currentWord) {
          const soundUrl = soundRegion === 'US' ? currentWord.AudioUS : currentWord.AudioUK;
          if (soundUrl) {
            playSound(soundUrl);
            setPlayedCards(prev => new Set(prev).add(safeIndex));
          }
        }
      }
    }
  };


  const playSound = (audioUrl) => {
    if (!audioUrl) return;
  
    setSoundUrl(audioUrl);
    setWebviewKey(prevKey => prevKey + 1);
  };

  useEffect(() => {
    if (wordsArray.length) {
      const processedTexts = wordsArray.map(word => {
        const examples = {
          en: word.Example || 'No example available',
          vi: word.ExampleVI || 'Không có ví dụ'
        };
        
        return {
          en: examples.en
            .replace(/<\/?li[^>]*>/g, '')  
            .replace(/<[^>]+>/g, '')      
            .split(';')                  
            .filter(Boolean)              
            .map(item => `- ${item.trim()}`)  
            .join('\n'),                  
          vi: examples.vi
            .replace(/<\/?li[^>]*>/g, '')
            .replace(/<[^>]+>/g, '')
            .split(';')
            .filter(Boolean)
            .map(item => `- ${item.trim()}`)
            .join('\n')
        };
      });
      setExampleTexts(processedTexts);
    }
  }, [wordsArray]);

  const shuffleArray = useCallback(() => {
    const shuffled = [...wordsArray].sort(() => Math.random() - 0.5);
    setWordsArray(shuffled);
    setCurrentCardIndex(0);
    setPlayedCards(new Set());
    setScrollDirection(null);
    lastOffset.current = 0;
  }, [wordsArray]);

  const playInitialSound = () => {
    if (autoPlay && wordsArray.length > 0 && !playedCards.has(0)) {
      const firstWord = wordsArray[0];
      const soundUrl = soundRegion === 'US' ? firstWord.AudioUS : firstWord.AudioUK;
      if (soundUrl) {
        playSound(soundUrl);
        setPlayedCards(prev => new Set(prev).add(0));
      }
    }
  };

  useEffect(() => {
    if (wordsArray.length > 0) {
      playInitialSound();
    }
  }, []);

  useEffect(() => {
    if (wordsArray.length > 0) {
      setPlayedCards(new Set());
      setScrollDirection(null);
      lastOffset.current = 0;
      playInitialSound();
    }
  }, [autoPlay, soundRegion]);

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
                  {currentCardIndex + 1}/{Math.min(wordsArray.length, 10)}
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

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={fetchWords}>
            <Icon name="refresh" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Làm mới</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={shuffleArray}>
            <Icon name="shuffle" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Xáo trộn</Text>
          </TouchableOpacity>
        </View>
  
        <View style={styles.flashCardContainer}>
          <FlatList
            data={wordsArray.slice(0, 10)}
            renderItem={renderItem}
            keyExtractor={useCallback((item) => item.Id.toString(), [])}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            onScroll={handleScroll}
            contentContainerStyle={styles.flatListContentContainer}
            snapToInterval={width * 0.9}
            decelerationRate="fast"
            snapToAlignment="center"
            removeClippedSubviews={true}
            maxToRenderPerBatch={3}
            windowSize={5}
            initialNumToRender={2}
            getItemLayout={useCallback((data, index) => ({
              length: width * 0.9,
              offset: width * 0.9 * index,
              index,
            }), [])}
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
    
    height: 450,
    width: width * 0.85,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardFront: {
    borderRadius: 15,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  word: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  phoneticContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  phoneticItem: {
    marginBottom: 20,
  },
  regionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  phoneticText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
    marginRight: 10,
  },
  soundButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  phonetic: {
    fontSize: 22,
    color: '#FFF',
    opacity: 0.9,
    marginLeft: 5,
  },
  cardBack: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 25,
    height: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    marginTop: 10,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
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
    marginStart:'6%',
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
    width:170
  },
  definitionText: {
    fontSize: 16,
    color: '#34495E',
    marginBottom: 12,
    lineHeight: 24,
    paddingHorizontal: 5,
  },
  exampleText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    width: '100%',
    textAlign: 'center',
  },
});

export default FlashCardVoca;