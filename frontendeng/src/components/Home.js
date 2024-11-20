import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback, Keyboard, Image, ImageBackground, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/HomeStyles';
import useWordActions from '../hooks/useWordActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

const Home = () => {
  const navigation = useNavigation();
  const [keyword, setKeyword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWordDetail, setShowWordDetail] = useState(false);
  const [selectedWord, setSelectedWord] = useState({});
  const [userId, setUserId] = useState(null);
  const { mostFavoritedWords, searchResults, handleSearchWord, clearSearchResults, handleToggleFavoriteWord } = useWordActions();
  const [wordsArray, setWordsArray] = useState([]);
  const [webviewKey, setWebviewKey] = useState(0);
  const [soundUrl, setSoundUrl] = useState(null);
  const [background, setBackground] = useState(require('../assets/images/background.jpg'));

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        console.log('Loaded user:', user);
        if (user) {
          const { Id } = JSON.parse(user); 
          console.log('Loaded userId:', Id);
          setUserId(Id);
        } else {
          console.error('User not found in AsyncStorage');
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();
  }, []);


  
  const handleSearch = (text) => {
    handleSearchWord(text);
    setShowDropdown(true);
  };

  const handleChangeText = (text) => {
    setKeyword(text);
    handleSearch(text);
  };

  const handleDropdownItemPress = (item) => {
    setKeyword(item.Word);
    setShowDropdown(false);
    navigation.navigate('WordDetail', { wordId: item.Id });
  };

  const handlePressOutside = () => {
    setShowDropdown(false);
    setKeyword('');
    Keyboard.dismiss();
  };

  const handleToggleFavorite = useCallback(async (wordId) => {
    if (!userId) {
      console.error('User not found');
      return;
    }

    try {
      const updatedWords = mostFavoritedWords.map(word =>
        word.Id === wordId ? { ...word, isFavorite: !word.isFavorite } : word
      );

      await handleToggleFavoriteWord(userId, wordId);

      setWordsArray(updatedWords);

      const previousWords = await AsyncStorage.getItem(`wordsArray_${userId}`);
      let wordsToStore = [];

      if (previousWords) {
        wordsToStore = JSON.parse(previousWords);
      }

      const updatedWordsToStore = wordsToStore.map(word =>
        word.Id === wordId ? { ...word, isFavorite: !word.isFavorite } : word
      );

      if (!updatedWordsToStore.some(word => word.Id === wordId)) {
        const newWord = updatedWords.find(word => word.Id === wordId);
        updatedWordsToStore.push(newWord);
      }
      await AsyncStorage.setItem(`wordsArray_userId_${userId}`, JSON.stringify(updatedWordsToStore));
    } catch (error) {
      console.error('Failed to update favorite status:', error);
    }
  }, [mostFavoritedWords, handleToggleFavoriteWord, userId]);
  
  const renderItem = ({ item }) => (
    <View style={styles.transparentBox}>
      <View style={styles.wordContainer}>
        <Text style={styles.wordText}>{item.Word}</Text>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => {
            navigation.navigate('WordDetail', { wordId: item.Id });
          }}
        >
          <Text style={styles.ButtonDetail}>
            Xem chi tiết
          </Text>
        </TouchableOpacity>
      </View>
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
      <Text style={styles.definitionText}>{item.Definition}</Text>
  
      <View style={styles.divider} />
  
      <View style={styles.footer}>
        <Text style={styles.saveCount}>{item.FavoriteCount} lượt lưu</Text>
        <TouchableOpacity
          style={[styles.saveButton, item.userIds && item.userIds.includes(userId) ? styles.savedButton : styles.defaultButton]}
          onPress={() => handleToggleFavorite(item.Id)}
        >
          <Text style={[styles.saveButtonText, item.userIds && item.userIds.includes(userId) ? styles.savedText : styles.defaultText]}>
            {item.userIds && item.userIds.includes(userId) ? "ĐÃ LƯU" : "LƯU TỪ"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const playSound = (audioUrl) => {
    if (!audioUrl) return;
  
    // Đổi soundUrl và reset WebView
    setSoundUrl(audioUrl);
    setWebviewKey(prevKey => prevKey + 1);
  };

  const handleNavigateToFlashCard = () => {
    navigation.navigate('FlashCardVoca');
  };
  const handleNavigateToFlashCardFav = () => {
    navigation.navigate('FlashCardFav');
  };
  const handleNavigateToTest = () => {
    navigation.navigate('Test');
  };
  const handleNavigateToLevelWordGuess = () => {
    navigation.navigate('LevelWordGuess');
  };
  const handleNavigateToListen = () => {
    navigation.navigate('Listen');
  };
  const handleNavigateToChatBot = () => {
    navigation.navigate('ChatBot');
  };
  const handleNavigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const uniqueSearchResults = searchResults.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.Id === item.Id && t.Word.trim().toLowerCase() === item.Word.trim().toLowerCase())
  );
  const uniqueMostFavoritedWords = mostFavoritedWords.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.Id === item.Id && t.Word.trim().toLowerCase() === item.Word.trim().toLowerCase())
  );
  
  const limitedSearchResults = uniqueSearchResults.slice(0, 10);
  useEffect(() => {

    const checkDateAndSetBackground = () => {
      const currentDate = new Date();
      const currentDay = currentDate.getDate();

      if (currentDay % 2 === 0) {
        setBackground(require('../assets/images/background.jpg')); 
      } else {
        setBackground(require('../assets/images/background2.jpg')); 
      }
    };

    checkDateAndSetBackground();

    const intervalId = setInterval(checkDateAndSetBackground, 24 * 60 * 60 * 1000); 

    return () => clearInterval(intervalId);
  }, []);

  return (
    <TouchableWithoutFeedback onPress={handlePressOutside}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.languageText}>EasyEnglish</Text>
          <Icon name="notifications" size={24} color="gray" style={styles.bellIcon} />
        </View>
        <View style={styles.header2}>
          <View style={styles.headerContent}>
            <Text style={styles.dictionaryText}>Từ điển</Text>
            <TouchableOpacity style={styles.settingsContainer} onPress={handleNavigateToSettings}>
              <Text style={styles.settingsText}>Cài đặt</Text>
              <Icon name="settings" size={24} color="gray" style={styles.settingsIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="blue" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm..."
              value={keyword}
              onChangeText={handleChangeText}
              onFocus={() => setShowDropdown(true)}
            />
          </View>
          {showDropdown && keyword && (
            <View style={styles.dropdownContainer}>
              <ScrollView
                style={styles.dropdownScrollView}
                contentContainerStyle={styles.dropdownContentContainer}
                keyboardShouldPersistTaps="handled"
              >
                {limitedSearchResults.length > 0 ? (
                  limitedSearchResults.map((item) => (
                    <TouchableOpacity
                      key={`${item.Id}-${item.Word}`}
                      style={styles.dropdownItem}
                      onPress={() => handleDropdownItemPress(item)}
                    >
                      <Text>{item.Word}</Text>
                      <Text>{item.DefinitionVI ? item.DefinitionVI.split(';')[0] : 'No definition available'}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noResultsText}>Không có kết quả nào.</Text>
                )}
              </ScrollView>
            </View>
          )}
       
        <View style={styles.fixedView}>
          <ScrollView 
            horizontal 
            contentContainerStyle={styles.cardContainer}
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
          >
            <TouchableOpacity style={styles.card} onPress={handleNavigateToFlashCard}>
              <Text style={styles.cardText}>HỌC TỪ VỰNG</Text>
              <Image
                source={require('../assets/images/Study_Voca.png')}
                style={styles.cardImage}
              />
              <Text style={styles.cardSubText}>THÔNG QUA FLASHCARD</Text>
              <Icon name="arrow-forward" size={24} color="white" style={styles.cardIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, styles.cardGreen]} onPress={handleNavigateToFlashCardFav}>
              <Text style={styles.cardText}>TỪ VỰNG CỦA TÔI</Text>
              <Image
                source={require('../assets/images/Study_Fav.png')}
                style={styles.cardImage}
              />
              <Text style={styles.cardSubText}>THÔNG QUA FLASHCARD</Text>
              <Icon name="arrow-forward" size={24} color="white" style={styles.cardIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, styles.cardGreen]} onPress={handleNavigateToListen}>
              <Text style={styles.cardText}>ÔN TẬP NGHE</Text>
              <Image
                source={require('../assets/images/Study_Fav.png')}
                style={styles.cardImage}
              />
              <Text style={styles.cardSubText}>THÔNG QUA TRẮC NGHIỆM VÀ TỰ LUẬN</Text>
              <Icon name="arrow-forward" size={24} color="white" style={styles.cardIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, styles.cardGreen]} onPress={handleNavigateToTest}>
              <Text style={styles.cardText}>KIỂM TRA TỪ VỰNG</Text>
              <Image
                source={require('../assets/images/Study_Fav.png')}
                style={styles.cardImage}
              />
              <Text style={styles.cardSubText}>THÔNG QUA TRẮC NGHIỆM</Text>
              <Icon name="arrow-forward" size={24} color="white" style={styles.cardIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.card, styles.cardGreen]} onPress={handleNavigateToLevelWordGuess}>
              <Text style={styles.cardText}>GIẢI TRÍ</Text>
              <Image
                source={require('../assets/images/Study_Fav.png')}
                style={styles.cardImage}
              />
              <Text style={styles.cardSubText}>THÔNG QUA WORD GUESS</Text>
              <Icon name="arrow-forward" size={24} color="white" style={styles.cardIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.card, styles.cardGreen]} onPress={handleNavigateToChatBot}>
              <Text style={styles.cardText}>GIẢI ĐÁP</Text>
              <Image
                source={require('../assets/images/Study_Fav.png')}
                style={styles.cardImage}
              />
              <Text style={styles.cardSubText}>THÔNG QUA CHAT BOT</Text>
              <Icon name="arrow-forward" size={24} color="white" style={styles.cardIcon} />
            </TouchableOpacity>
          </ScrollView>
          <View style={styles.popularWordContainer}>
            <ImageBackground source={background} style={styles.backImage}>
              <Text style={styles.popularWordText}>ĐANG ĐƯỢC ĐỀ XUẤT HÔM NAY</Text>
              <FlatList
                data={uniqueMostFavoritedWords}
                renderItem={renderItem}
                keyExtractor={(item) => item.Id.toString()}
                horizontal
                contentContainerStyle={styles.flatListContainer}
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToAlignment="center"
                pagingEnabled
              />
            </ImageBackground>
          </View>
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
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Home;
