import React, { useState, useEffect } from 'react'; 
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

const FlashCardFav = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userId, setUserId] = useState(null);
  const [exampleTexts, setExampleTexts] = useState([]);
  const [wordsArray, setWordsArray] = useState([]);
  const [soundUrl, setSoundUrl] = useState(null);
  const [webviewKey, setWebviewKey] = useState(0);

  const {
    status,
    error,
    favoriteWords,
    handleFetchFavoriteWords,
    handleToggleFavoriteWord,
  } = useWordActions();

  const navigation = useNavigation();

  // Fetch userId once on component mount
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

  // Fetch favorite words when userId changes
  useEffect(() => {
    if (userId) {
      handleFetchFavoriteWords(userId);
    }
  }, [userId]); // Removed handleFetchFavoriteWords from dependencies

  // Process example texts when favoriteWords change
  useEffect(() => {
    if (favoriteWords.length) {
      const processedTexts = favoriteWords.map(word => {
        return word.Example
          ? word.Example
              .replace(/<\/?li[^>]*>/g, '')
              .replace(/<[^>]+>/g, '')
              .split(';')
              .filter(Boolean)
              .map(item => `- ${item.trim()}`)
              .join('\n')
          : 'No example available';
      });
      setExampleTexts(processedTexts);
    }
  }, [favoriteWords]);
  

  // Load words array from AsyncStorage
  useEffect(() => {
    const loadWordsArray = async (userId) => {
      try {
        const storedWordsArray = await AsyncStorage.getItem(`wordsArray_userId_${userId}`);
        if (storedWordsArray) {
          const parsedWordsArray = JSON.parse(storedWordsArray);
          if (Array.isArray(parsedWordsArray)) {
            setWordsArray(parsedWordsArray);
          }
        }
      } catch (error) {
        console.error('Failed to load words from AsyncStorage:', error);
      }
    };

    if (userId) {
      loadWordsArray(userId);
    }
  }, [userId]);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / (width * 0.9));
    setCurrentCardIndex(currentIndex);
  };

  const handleToggleFavoriteWordWithLogging = async (wordId) => {
    if (!userId || !wordId) return;

    try {
      await handleToggleFavoriteWord(userId, wordId);
      const updatedWordsArray = wordsArray.map(word => (
        word.Id === wordId ? { ...word, isFavorite: !word.isFavorite } : word
      ));
      setWordsArray(updatedWordsArray);
      await AsyncStorage.setItem(`wordsArray_userId_${userId}`, JSON.stringify(updatedWordsArray));
    } catch (error) {
      console.error('Failed to toggle favorite word:', error);
    }
  };
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
  const renderItem = ({ item, index }) => (
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
          colors={['#353A5F', '#9EBAF3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardFront}
        >
          <TouchableOpacity
            style={styles.favoriteIcon}
            onPress={() => handleToggleFavoriteWordWithLogging(item.Id)}
          >
            <Icon name='close' size={24} color='red' />
          </TouchableOpacity>
                   <View style={styles.soundIconContainer}>
            {/* Nút phát âm thanh giọng US */}
            <TouchableOpacity  
              style={styles.soundIcon}
              onPress={() => playSound(item.AudioUS)}
            >
              <Icon name="volume-up" size={24} color="white" />
              <Text style={styles.phoneticText}>US</Text>
            </TouchableOpacity>

            {/* Nút phát âm thanh giọng UK */}
            <TouchableOpacity 
              style={styles.soundIcon}
              onPress={() => playSound(item.AudioUK)}
            >
              <Icon name="volume-up" size={24} color="white" />
              <Text style={styles.phoneticText}>UK</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.word}>{item.Word}</Text>
          <Text style={styles.phonetic}>{item.PhoneticUK}</Text>
          <Text style={styles.phonetic}>{item.PhoneticUS}</Text>
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
                {item.Example ? item.Example.replace(/<\/?li[^>]*>/g, '').replace(/<[^>]+>/g, '').split(';')[0] : 'No example available'}
              </Text>
              <Text style={styles.example}>
                {item.ExampleVI ? item.ExampleVI.replace(/<\/?li[^>]*>/g, '').replace(/<[^>]+>/g, '').split(';')[0] : 'No Vietnamese example available'}
              </Text>
            </ScrollView>
          </View>
        </View>
      </FlipCard>
    </View>
  );
  const playSound = (audioUrl) => {
    if (!audioUrl) return;
    
    // Thay đổi soundUrl và reset WebView
    setSoundUrl(audioUrl);
    
    // Tạo mới key để làm mới WebView
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
            title={
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  {currentCardIndex + 1}/{wordsArrayLength}
                </Text>
              </View>
            }
          />
        </Appbar.Header>

        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarBackground}>
            <View
              style={[styles.progressBarFill, { width: `${((currentCardIndex + 1) / (wordsArrayLength || 1)) * 100}%` }]}
            />
          </View>
        </View>

        <View style={styles.flashCardContainer}>
          <FlatList
            data={favoriteWords}
            renderItem={renderItem}
            keyExtractor={item => item.Id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            snapToInterval={width * 0.9}
            decelerationRate="fast"
            onScroll={handleScroll}
          />
        </View>

        {!status && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
        {status === 'failed' && error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
    marginStart: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.9,
    marginTop: '10%',
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
    alignItems: 'center',
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
  title: {
    fontSize: 18,
    fontWeight: 'bold', 
    textAlign: 'left', 
    marginBottom: 10,
    color: '#555',
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
    width: '100%',
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
  soundIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  soundIconContainer: {
    flexDirection: 'row', // Xếp hàng ngang
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10, // Khoảng cách trên dưới giữa các nút
  },
  soundIcon: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 10, // Khoảng cách giữa các nút
  },
  phoneticText: {
    color: 'white',
    marginLeft: 5, // Khoảng cách giữa biểu tượng và chữ "US" hoặc "UK"
  }
});

export default FlashCardFav;
