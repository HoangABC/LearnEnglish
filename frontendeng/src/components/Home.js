import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback, Keyboard, Image,ImageBackground, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/HomeStyles';
import useWordActions from '../hooks/useWordActions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const itemWidth = 443.2; 


const Home = () => {
  const navigation = useNavigation(); 
  const [keyword, setKeyword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWordDetail, setShowWordDetail] = useState(false); // Trạng thái để quản lý WordDetail
  const [selectedWord, setSelectedWord] = useState({}); // Initialize as empty object
  const [userId, setUserId] = useState(null); // Correct initialization
  const { mostFavoritedWords, searchResults, handleSearchWord, clearSearchResults,  handleToggleFavoriteWord } = useWordActions();
  const [wordsArray, setWordsArray] = useState([]);
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        console.log('Loaded user:', user);
        if (user) {
          const { Id } = JSON.parse(user); // Extract Id with capital "I"
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
  const renderItem = ({ item }) => (
    <View style={styles.transparentBox}>
      <Text style={styles.wordText}>{item.Word}</Text>
      <View style={styles.phoneticContainer}>
        <Text style={styles.phoneticText}>UK: {item.PhoneticUK}</Text>
        <Text style={styles.phoneticText}>US: {item.PhoneticUS}</Text>
      </View>
      <Text style={styles.definitionText}>{item.Definition}</Text>
  
      <View style={styles.divider} />
  
      <View style={styles.footer}>
        <Text style={styles.saveCount}>{item.FavoriteCount} lượt lưu</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => handleToggleFavorite(item.Id)}
        >
          <Text style={styles.saveButtonText}>
            {item.isFavorite ? "ĐÃ LƯU" : "LƯU TỪ"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const handleToggleFavorite = useCallback(async (wordId) => {
    console.log('userId:', userId);
    if (!userId) {
      console.error('User not found');
      return;
    }
  
    const updatedWords = mostFavoritedWords.map(word =>
      word.Id === wordId ? { ...word, isFavorite: !word.isFavorite } : word
    );
  
    try {
      await handleToggleFavoriteWord(userId, wordId); // Gửi yêu cầu đến API với userId
      // Cập nhật danh sách mostFavoritedWords tại chỗ
      setWordsArray(updatedWords);
    } catch (error) {
      console.error('Failed to update favorite status:', error);
    }
  }, [mostFavoritedWords, handleToggleFavoriteWord, userId]);
  
  

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

  // Lọc các kết quả tìm kiếm để loại bỏ từ trùng lặp
  const uniqueSearchResults = searchResults.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.Word === item.Word)
  );

  const limitedSearchResults = uniqueSearchResults.slice(0, 10);

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
                      key={item.Id} // Đảm bảo mỗi phần tử có thuộc tính key duy nhất
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
              <Text style={styles.cardText}>KIỂM TRA NGHE</Text>
              <Image
                source={require('../assets/images/Study_Fav.png')}
                style={styles.cardImage}
              />
              <Text style={styles.cardSubText}>THÔNG QUA TRẮC NGHIỆM</Text>
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
            <ImageBackground source={require('../assets/images/background.jpg')} style={styles.backImage}>
              <Text style={styles.popularWordText}>ĐANG ĐƯỢC LƯU NHIỀU NHẤT HÔM NAY</Text>
              <FlatList
                data={mostFavoritedWords}
                renderItem={renderItem}
                keyExtractor={(item) => item.Id.toString()}
                horizontal
                contentContainerStyle={styles.flatListContainer}
                showsHorizontalScrollIndicator={false}
                snapToInterval={itemWidth} 
                decelerationRate="fast"
                snapToAlignment="center"
                pagingEnabled
                getItemLayout={(data, index) => ({
                  length: itemWidth, 
                  offset: itemWidth * index, 
                  index, 
                })}
              />
            </ImageBackground>
          </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Home;
