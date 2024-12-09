import React, { useState, useEffect, useRef } from 'react'; 
import { View, Text, ActivityIndicator, StyleSheet, FlatList, Dimensions, ScrollView, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import useWordActions from '../../hooks/useWordActions';
import FlipCard from 'react-native-flip-card';
import { Appbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import LinearGradient from 'react-native-linear-gradient';
import { WebView } from 'react-native-webview';
import RNFetchBlob from 'rn-fetch-blob';

const { width } = Dimensions.get('window');

const FlashCardFav = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userId, setUserId] = useState(null);
  const [exampleTexts, setExampleTexts] = useState([]);
  const [soundUrl, setSoundUrl] = useState(null);
  const [webviewKey, setWebviewKey] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false); 
  const [soundRegion, setSoundRegion] = useState('UK'); 
  const [playedCards, setPlayedCards] = useState(new Set());
  const [scrollDirection, setScrollDirection] = useState(null);
  const lastOffset = useRef(0);

  const {
    status,
    error,
    favoriteWords,
    handleFetchFavoriteWords,
    handleToggleFavoriteWord,
  } = useWordActions();

  const navigation = useNavigation();

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
        const autoPlaySound = await AsyncStorage.getItem('autoPlaySound');
        if (autoPlaySound) {
          const { isEnabled, region } = JSON.parse(autoPlaySound);
          setAutoPlay(isEnabled);
          setSoundRegion(region);
        }

        if (userId) {
          const offlineData = await AsyncStorage.getItem(`favoriteWords_${userId}`);
          if (offlineData) {
            const localFavorites = JSON.parse(offlineData);
            if (Array.isArray(localFavorites) && localFavorites.length > 0) {
              processAndSetExampleTexts(localFavorites);
              await preloadAllAudios(localFavorites);
              await handleFetchFavoriteWords(userId);
            }
          }

          const checkNetwork = async () => {
            try {
              const response = await fetch('https://www.google.com', { 
                method: 'HEAD',
                mode: 'no-cors',
                timeout: 5000
              });
              return true;
            } catch (error) {
              return false;
            }
          };

          const hasNetwork = await checkNetwork();

          if (hasNetwork) {
            console.log('Using online data');
            try {
              await handleFetchFavoriteWords(userId);
              const onlineData = favoriteWords;
              
              if (Array.isArray(onlineData) && onlineData.length > 0) {
                await AsyncStorage.setItem(
                  `favoriteWords_${userId}`, 
                  JSON.stringify(onlineData)
                );
                processAndSetExampleTexts(onlineData);
                await preloadAllAudios(onlineData);
              }
            } catch (error) {
              console.log('Failed to fetch online data, using offline data');
              if (offlineData) {
                const localFavorites = JSON.parse(offlineData);
                if (Array.isArray(localFavorites) && localFavorites.length > 0) {
                  processAndSetExampleTexts(localFavorites);
                  await handleFetchFavoriteWords(userId);
                }
              }
            }
          } else {
            console.log('Using offline data');
            if (offlineData) {
              const localFavorites = JSON.parse(offlineData);
              if (Array.isArray(localFavorites) && localFavorites.length > 0) {
                processAndSetExampleTexts(localFavorites);
                await handleFetchFavoriteWords(userId);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load settings or favorite words:', error);
        try {
          const offlineData = await AsyncStorage.getItem(`favoriteWords_${userId}`);
          if (offlineData) {
            const localFavorites = JSON.parse(offlineData);
            if (Array.isArray(localFavorites) && localFavorites.length > 0) {
              processAndSetExampleTexts(localFavorites);
              await handleFetchFavoriteWords(userId);
            }
          }
        } catch (offlineError) {
          console.error('Failed to load offline data:', offlineError);
        }
      }
    };

    fetchSettingsAndFavoriteWords();
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


  useEffect(() => {
    if (favoriteWords.length > 0 && autoPlay && !playedCards.has(0)) {
      const firstWord = favoriteWords[0];
      const soundUrl = soundRegion === 'US' ? firstWord.AudioUS : firstWord.AudioUK;
      if (soundUrl) {
        playSound(soundUrl);
        setPlayedCards(prev => new Set(prev).add(0));
      }
    }
  }, [favoriteWords, autoPlay, soundRegion]);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / (width * 0.9));
    

    const currentDirection = offsetX > lastOffset.current ? 'forward' : 'backward';

    if (currentDirection !== scrollDirection) {
      setScrollDirection(currentDirection);
      setPlayedCards(new Set());
    }

    lastOffset.current = offsetX;

    const safeIndex = Math.min(newIndex, favoriteWords.length - 1);

    if (
      (currentCardIndex === favoriteWords.length - 1 && safeIndex === 0) ||
      (currentCardIndex === 0 && safeIndex === favoriteWords.length - 1)
    ) {
      setPlayedCards(new Set());
    }

    if (safeIndex !== currentCardIndex) {
      setCurrentCardIndex(safeIndex);

      if (autoPlay && !playedCards.has(safeIndex)) {
        const currentWord = favoriteWords[safeIndex];
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
  
  const handleToggleFavoriteWordWithLogging = async (wordId) => {
    if (!userId) {
      console.error('User not found');
      return;
    }

    try {
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        mode: 'no-cors',
        timeout: 5000
      });
      
      await handleToggleFavoriteWord(userId, wordId);
      await handleFetchFavoriteWords(userId);

      try {
        const vocaWordsJson = await AsyncStorage.getItem(`wordsArray_${userId}`);
        if (vocaWordsJson) {
          const vocaWords = JSON.parse(vocaWordsJson);
          const updatedVocaWords = vocaWords.map(word =>
            word.Id === wordId ? { ...word, isFavorite: false } : word
          );
          
          await AsyncStorage.setItem(`wordsArray_${userId}`, JSON.stringify(updatedVocaWords));
          console.log('Updated favorite status in FlashCardVoca local storage');
        }
      } catch (error) {
        console.error('Error updating FlashCardVoca local storage:', error);
      }

    } catch (error) {
      Alert.alert(
        'Chế độ Ngoại tuyến',
        'Bạn đang ở chế độ ngoại tuyến. Vui lòng kết nối internet để thực hiện thao tác này.',
        [{ text: 'Đồng ý', onPress: () => console.log('OK Pressed') }]
      );
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


  const playSound = async (audioUrl) => {
    if (!audioUrl) return;

    try {

      const audioKey = `audio_${audioUrl.split('/').pop()}`;
      const localAudioBase64 = await AsyncStorage.getItem(audioKey);

      if (localAudioBase64) {

        console.log('Playing from local storage');
        const base64Audio = `data:audio/mp3;base64,${localAudioBase64}`;
        setSoundUrl(base64Audio);
        setWebviewKey(prev => prev + 1);
      } else {

        try {
          await fetch('https://www.google.com', { mode: 'no-cors' });

          console.log('Playing and downloading');
          setSoundUrl(audioUrl);
          setWebviewKey(prev => prev + 1);

          const response = await RNFetchBlob.fetch('GET', audioUrl);
          if (response.info().status === 200) {
            const base64Data = response.base64();
            await AsyncStorage.setItem(audioKey, base64Data);
          }
        } catch (error) {
          console.log('Offline - no audio available');
        }
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };


  // const preloadAudios = async (words) => {
  //   try {
  //     for (const word of words) {
  //       const ukAudioKey = `audio_${word.AudioUK.split('/').pop()}`;
  //       const usAudioKey = `audio_${word.AudioUS.split('/').pop()}`;

 
  //       if (word.AudioUK && !(await AsyncStorage.getItem(ukAudioKey))) {
  //         const ukResponse = await RNFetchBlob.fetch('GET', word.AudioUK);
  //         if (ukResponse.info().status === 200) {
  //           const base64Data = ukResponse.base64();
  //           await AsyncStorage.setItem(ukAudioKey, base64Data);
  //         }
  //       }


  //       if (word.AudioUS && !(await AsyncStorage.getItem(usAudioKey))) {
  //         const usResponse = await RNFetchBlob.fetch('GET', word.AudioUS);
  //         if (usResponse.info().status === 200) {
  //           const base64Data = usResponse.base64();
  //           await AsyncStorage.setItem(usAudioKey, base64Data);
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error preloading audios:', error);
  //   }
  // };


  const preloadAllAudios = async (words) => {
    try {
      console.log(`Starting to preload ${words.length * 2} audio files...`);
      
      for (const word of words) {
        if (word.AudioUK) {
          const ukAudioKey = `audio_${word.AudioUK.split('/').pop()}`;
          try {
            const existingUKAudio = await AsyncStorage.getItem(ukAudioKey);
            if (!existingUKAudio) {
              console.log(`Downloading UK audio for: ${word.Word}`);
              const ukResponse = await RNFetchBlob.fetch('GET', word.AudioUK);
              if (ukResponse.info().status === 200) {
                const ukBase64Data = ukResponse.base64();
                await AsyncStorage.setItem(ukAudioKey, ukBase64Data);
                console.log(`Successfully saved UK audio for: ${word.Word}`);
              }
            }
          } catch (ukError) {
            console.error(`Failed to download UK audio for ${word.Word}:`, ukError);
          }
        }

        if (word.AudioUS) {
          const usAudioKey = `audio_${word.AudioUS.split('/').pop()}`;
          try {
            const existingUSAudio = await AsyncStorage.getItem(usAudioKey);
            if (!existingUSAudio) {
              console.log(`Downloading US audio for: ${word.Word}`);
              const usResponse = await RNFetchBlob.fetch('GET', word.AudioUS);
              if (usResponse.info().status === 200) {
                const usBase64Data = usResponse.base64();
                await AsyncStorage.setItem(usAudioKey, usBase64Data);
                console.log(`Successfully saved US audio for: ${word.Word}`);
              }
            }
          } catch (usError) {
            console.error(`Failed to download US audio for ${word.Word}:`, usError);
          }
        }
      }

      console.log('Audio preload process completed');
    } catch (error) {
      console.error('Error in preloadAllAudios:', error);
    }
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

  const handleRefresh = async () => {
    if (userId) {
      try {

        const offlineFavorites = await AsyncStorage.getItem(`favoriteWords_${userId}`);
        if (offlineFavorites) {
          const favWords = JSON.parse(offlineFavorites);
          if (Array.isArray(favWords) && favWords.length > 0) {
            return;
          }
        }
 
        await handleFetchFavoriteWords(userId);
      } catch (error) {
        console.error('Failed to refresh favorite words:', error);
      }
    }
  };


  const processAndSetExampleTexts = (words) => {
    const processedTexts = words.map(word => ({
      en: (word.Example || 'No example available')
        .replace(/<\/?li[^>]*>/g, '')
        .replace(/<[^>]+>/g, '')
        .split(';')
        .filter(Boolean)
        .map(item => `- ${item.trim()}`)
        .join('\n'),
      vi: (word.ExampleVI || 'Không có ví dụ')
        .replace(/<\/?li[^>]*>/g, '')
        .replace(/<[^>]+>/g, '')
        .split(';')
        .filter(Boolean)
        .map(item => `- ${item.trim()}`)
        .join('\n')
    }));
    setExampleTexts(processedTexts);
  };


  useEffect(() => {
    if (autoPlay || soundRegion) {
      setPlayedCards(new Set());
      setScrollDirection(null);
      lastOffset.current = 0;
    }
  }, []);


  if (!favoriteWords || favoriteWords.length === 0) {
    return (
      <ImageBackground
        source={require('../../assets/images/background_flashcard.jpg')}
        style={styles.backgroundImage}
      >
        <View style={styles.container}>
          <Appbar.Header style={styles.header}>
            <Appbar.BackAction onPress={() => navigation.goBack()} />
            <Appbar.Content title="Favorite Words" />
          </Appbar.Header>
         
        </View>
      </ImageBackground>
    );
  }

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
                  {Math.min(currentCardIndex + 1, favoriteWords.length)}/{favoriteWords.length}
                </Text>
              </View>
            }
          />
        </Appbar.Header>

        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill, 
                { 
                  width: `${(Math.min(currentCardIndex + 1, favoriteWords.length) / favoriteWords.length) * 100}%` 
                }
              ]}
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
    flexDirection: 'column', 
    justifyContent: 'flex-start', 
    alignItems: 'center',  
    marginBottom: 10,
    width: '100%'
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
  phonetic: {
    fontSize: 20,
    color: 'white',
    width: 125,
    width:'50%'
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
  soundIcon: {
    marginHorizontal: 10,
    alignItems: 'center',
  },
  soundButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  regionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  soundIconContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10, 
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
});

export default FlashCardFav;