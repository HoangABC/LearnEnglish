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
  const [soundUrl, setSoundUrl] = useState(null);
  const [webviewKey, setWebviewKey] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false); 
  const [soundRegion, setSoundRegion] = useState('UK'); 

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

  useEffect(() => {
    const fetchSettingsAndFavoriteWords = async () => {
      try {
        // Fetch Auto Play Settings
        const autoPlaySound = await AsyncStorage.getItem('autoPlaySound');
        if (autoPlaySound) {
          const { isEnabled, region } = JSON.parse(autoPlaySound);
          setAutoPlay(isEnabled);
          setSoundRegion(region); // Cập nhật vùng phát âm
        }
        
        // Fetch Favorite Words (nếu đã có userId)
        if (userId) {
          handleFetchFavoriteWords(userId);
        }
      } catch (error) {
        console.error('Failed to load settings or favorite words:', error);
      }
    };
  
    fetchSettingsAndFavoriteWords();
  }, [userId]);  // Chạy lại khi userId thay đổi
  
  useEffect(() => {
    if (userId) {
      handleFetchFavoriteWords(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (favoriteWords.length) {
      const processedTexts = favoriteWords.map(word => {
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
  }, [favoriteWords]);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / (width * 0.9));
    setCurrentCardIndex(currentIndex);
  
    const currentWord = favoriteWords[currentIndex];
  
    // If autoPlay is enabled and there is a current word, play the sound
    if (autoPlay && currentWord) {
      const soundUrl = soundRegion === 'US' ? currentWord.AudioUS : currentWord.AudioUK;
      if (soundUrl) {
        playSound(soundUrl);
      }
    }
  };
  
  const handleToggleFavoriteWordWithLogging = async (wordId) => {
    if (!userId || !wordId) return;
  
    try {
      const updatedFavoriteWords = favoriteWords.map(word => (
        word.Id === wordId ? { ...word, isFavorite: false } : word
      ));

      await AsyncStorage.setItem(`wordsArray_userId_${userId}`, JSON.stringify(updatedFavoriteWords));
      console.log('update', updatedFavoriteWords)

      await handleToggleFavoriteWord(userId, wordId);
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


  const playSound = (audioUrl) => {
    if (!audioUrl) return;
  
    // Update soundUrl and reset WebView
    setSoundUrl(audioUrl);
  
    // Create a new key to reload WebView
    setWebviewKey(prevKey => prevKey + 1);
  };
  
  const renderItem = ({ item, index }) => {
    return (
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
              onPress={() => handleToggleFavoriteWordWithLogging(item.Id)}
            >
              <Icon name='close' size={24} color='#FF6B6B' />
            </TouchableOpacity>
            <Text style={styles.word}>{item.Word}</Text>
  
            {/* Phonetic sections */}
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
              {formatDefinition(item.Definition)}
              
              <Text style={styles.sectionTitle}>Vietnamese Definition:</Text>
              {formatDefinition(item.DefinitionVI)}
              
              <Text style={styles.sectionTitle}>Example:</Text>
              <Text style={styles.exampleText}>{exampleTexts[index]?.en}</Text>
              
              <Text style={styles.sectionTitle}>Vietnamese Example:</Text>
              <Text style={styles.exampleText}>{exampleTexts[index]?.vi}</Text>
            </ScrollView>
          </View>
        </FlipCard>
      </View>
    );
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
    justifyContent: 'center', // Căn giữa theo chiều dọc
    alignItems: 'center', // Căn giữa theo chiều ngang
    width: width * 0.9, 
    height: '100%', // Đảm bảo chiều cao đầy đủ để căn giữa
  },
  flipCard: {
    marginStart: 9,
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
    padding: 20,
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
  definition: {
    fontSize: 16,
    color: '#34495E',
    marginBottom: 12,
    lineHeight: 24,
  },
  exampleText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontStyle: 'italic',
    lineHeight: 24,
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
    justifyContent: 'center', // Căn giữa theo chiều dọc
    alignItems: 'center', // Căn giữa theo chiều ngang
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
    width:120
  },
});

export default FlashCardFav;