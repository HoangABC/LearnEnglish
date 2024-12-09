import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback, Keyboard, Image, ImageBackground, FlatList, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/HomeStyles';
import useWordActions from '../hooks/useWordActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import useFeedback from '../hooks/useFeedback'
import { useDispatch, useSelector } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';

const Home = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isOnline, setIsOnline] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [userId, setUserId] = useState(null);
  const { mostFavoritedWords, searchResults, handleSearchWord, clearSearchResults, handleToggleFavoriteWord } = useWordActions();
  const [wordsArray, setWordsArray] = useState([]);
  const [webviewKey, setWebviewKey] = useState(0);
  const [soundUrl, setSoundUrl] = useState(null);
  const [background, setBackground] = useState(require('../assets/images/background.jpg'));
  const [notifications, setNotifications] = useState([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { getFeedbacks, feedbacks: feedbacksData } = useFeedback();
  const [feedbacks, setFeedbacks] = useState([]);
  const [storedFeedbacks, setStoredFeedbacks] = useState([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [hiddenFeedbacks, setHiddenFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [viewedFeedbacks, setViewedFeedbacks] = useState(new Set());

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const { Id } = JSON.parse(user);
          setUserId(Id);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const checkNotifications = async () => {
      try {
        await getFeedbacks(userId);
        await loadStoredFeedbacks();
      } catch (error) {
        console.error('Failed to check notifications:', error);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadStoredFeedbacks = async () => {
    try {
      if (!userId) return;
      const stored = await AsyncStorage.getItem(`AdFeedback_${userId}`);
      const parsedStored = stored ? JSON.parse(stored) : [];
      setStoredFeedbacks(parsedStored);
      const unreadCount = parsedStored.filter(feedback => 
        feedback.viewed === 0 && feedback.UserId === userId
      ).length;
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Error loading stored feedbacks:', error);
    }
  };

  useEffect(() => {
    if (feedbacksData?.data && userId) {
      const userNotifications = feedbacksData.data.filter(feedback => 
        feedback.UserId === userId && feedback.FeedbackStatus === 2
      );
      
      const storeFeedbacks = async () => {
        try {
          const existingFeedbacks = await AsyncStorage.getItem(`AdFeedback_${userId}`);
          const parsedExisting = existingFeedbacks ? JSON.parse(existingFeedbacks) : [];
          
          const existingMap = new Map(
            parsedExisting.map(feedback => [feedback.FeedbackId, feedback])
          );
          
          const mergedFeedbacks = userNotifications.map(newFeedback => {
            const existing = existingMap.get(newFeedback.FeedbackId);
            return {
              ...newFeedback,
              viewed: existing ? existing.viewed : 0
            };
          });

          await AsyncStorage.setItem(`AdFeedback_${userId}`, JSON.stringify(mergedFeedbacks));
          await loadStoredFeedbacks();
        } catch (error) {
          console.error('Error storing feedbacks:', error);
        }
      };

      storeFeedbacks();
      setFeedbacks(userNotifications);
      setNotifications(userNotifications);
    }
  }, [feedbacksData, userId]);

  useEffect(() => {
    const loadData = async () => {
      if (isOnline && userId) {
        try {
          await getFeedbacks(userId);
          await handleSearchWord('');
          setIsDataLoaded(true);
        } catch (error) {
          console.error('Failed to reload data:', error);
        }
      }
    };

    loadData();
  }, [isOnline]);

  const handleSearch = useCallback((text) => {
    handleSearchWord(text);
    setShowDropdown(true);
  }, [handleSearchWord]);

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
      await handleToggleFavoriteWord(userId, wordId);

      const updatedWords = mostFavoritedWords.map(word =>
        word.Id === wordId 
          ? { 
              ...word, 
              userIds: word.userIds?.includes(userId)
                ? word.userIds.filter(id => id !== userId)
                : [...(word.userIds || []), userId],
              FavoriteCount: word.userIds?.includes(userId)
                ? word.FavoriteCount - 1
                : word.FavoriteCount + 1
            }
          : word
      );

      dispatch({
        type: 'words/fetchMostFavoritedWordsToday/fulfilled',
        payload: updatedWords
      });

      try {
        const storedWords = await AsyncStorage.getItem(`wordsArray_${userId}`);
        let wordsToStore = storedWords ? JSON.parse(storedWords) : [];
        
        const updatedStoredWords = wordsToStore.map(word =>
          word.Id === wordId
            ? {
                ...word,
                userIds: word.userIds?.includes(userId)
                  ? word.userIds.filter(id => id !== userId)
                  : [...(word.userIds || []), userId],
                FavoriteCount: word.userIds?.includes(userId)
                  ? word.FavoriteCount - 1
                  : word.FavoriteCount + 1
              }
            : word
        );

        await AsyncStorage.setItem(`wordsArray_${userId}`, JSON.stringify(updatedStoredWords));
      } catch (storageError) {
        console.error('Failed to update local storage:', storageError);
      }

    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      Alert.alert(
        'Lỗi',
        'Không thể cập nhật trạng thái yêu thích. Vui lòng thử lại sau.',
        [{ text: 'OK' }]
      );
    }
  }, [mostFavoritedWords, handleToggleFavoriteWord, userId, dispatch]);
  
  const formatTime = (dateString) => {
    const utcDate = new Date(dateString.replace('Z', ''));  
    
    const vnTime = utcDate.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
      hour12: false
    });
    
    return vnTime;
  };

  const renderFeedbackItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={[
        styles.feedbackItem,
        item.viewed === 1 && styles.viewedFeedbackItem
      ]}
      onPress={() => handleNotificationItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.feedbackContent}>
        <Text style={[
          styles.feedbackTime,
          item.viewed === 1 && styles.viewedText
        ]}>
          {formatTime(item.FeedbackCreatedAt)}
        </Text>
        <Text style={[
          styles.feedbackSender,
          item.viewed === 1 && styles.viewedText
        ]}>[TB] {item.FeedbackTitle || 'Thông báo'}</Text>
        <Text 
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.feedbackMessage,
            item.viewed === 1 && styles.viewedText
          ]}
        >
          {item.FeedbackText}
        </Text>
      </View>
      {showAllNotifications && (
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleHideFeedback(item.FeedbackId)}
        >
          <Icon name="close" size={20} style={styles.deleteIcon} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  ), [handleNotificationItemPress, showAllNotifications]);

  const handleNotificationItemPress = useCallback(async (feedback) => {
    try {
      if (feedback.UserId !== userId) return;

      setViewedFeedbacks(prev => new Set([...prev, feedback.FeedbackId]));

      const existingData = await AsyncStorage.getItem(`AdFeedback_${userId}`);
      const currentFeedbacks = existingData ? JSON.parse(existingData) : [];

      const feedbackMap = new Map(
        currentFeedbacks.map(item => [item.FeedbackId, item])
      );

      feedbackMap.set(feedback.FeedbackId, {
        ...feedback,
        viewed: 1
      });

      const updatedFeedbacks = Array.from(feedbackMap.values());

      await AsyncStorage.setItem(`AdFeedback_${userId}`, JSON.stringify(updatedFeedbacks));
      
      setStoredFeedbacks(updatedFeedbacks);
      
      const newUnreadCount = updatedFeedbacks.filter(item => 
        item.viewed === 0 && item.UserId === userId
      ).length;
      setUnreadCount(newUnreadCount);

      setShowNotificationModal(false);
      
      setTimeout(() => {
        navigation.navigate('Feedback', { 
          selectedFeedbackId: feedback.FeedbackId,
          feedback: feedback
        });
      }, 300);

    } catch (error) {
      console.error('Error handling notification press:', error);
      Alert.alert('Lỗi', 'Không thể xử lý thông báo. Vui lòng thử lại.');
    }
  }, [navigation, userId, viewedFeedbacks]);

  const renderItem = ({ item }) => (
    <View style={styles.transparentBox}>
      <View style={styles.wordContainer}>
        <Text style={styles.wordText}>{item.Word}</Text>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => {
            navigation.navigate('WordDetail', { 
              wordId: item.Id,
              isSaved: item.userIds?.includes(userId)
            });
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
      <View style={styles.definitionContainer}>
        <ScrollView 
          style={styles.definitionScrollView}
          contentContainerStyle={styles.definitionContentContainer}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.definitionText} numberOfLines={0}>
            {item.Definition}
          </Text>
        </ScrollView>
      </View>
      <View style={styles.divider} />
  
      <View style={styles.footer}>
        <Text style={styles.saveCount}>{item.FavoriteCount || 0} lượt lưu</Text>
        <TouchableOpacity
          style={[
            styles.saveButton,
            item.userIds?.includes(userId) ? styles.savedButton : styles.defaultButton
          ]}
          onPress={() => handleToggleFavorite(item.Id)}
        >
          <Text style={[
            styles.saveButtonText,
            item.userIds?.includes(userId) ? styles.savedText : styles.defaultText
          ]}>
            {item.userIds?.includes(userId) ? "ĐÃ LƯU" : "LƯU TỪ"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const playSound = (audioUrl) => {
    if (!audioUrl) return;

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
  const handleNavigateToVoiceAI = () => {
    navigation.navigate('VoiceAI');
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

  const handleNotificationPress = () => {
    setShowNotificationModal(true);
  };

  const toggleNotificationsView = () => {
    setShowAllNotifications(!showAllNotifications);
  };

  const additionalStyles = StyleSheet.create({
    viewedFeedbackItem: {
      backgroundColor: '#f5f5f5',
    },
    viewedText: {
      color: '#888',
    }
  });

  const renderStudyCards = () => {
    const cards = [
      {
        style: [styles.card, styles.cardBlue],
        text: "HỌC TỪ VỰNG",
        subText: "THÔNG QUA FLASHCARD",
        image: require('../assets/images/Study_Voca.png'),
        onPress: handleNavigateToFlashCard,
        requiresNetwork: true
      },
      {
        style: [styles.card, styles.cardGreen],
        text: "TỪ VỰNG CỦA TÔI",
        subText: "THÔNG QUA FLASHCARD",
        image: require('../assets/images/Study_Fav.png'),
        onPress: handleNavigateToFlashCardFav,
        requiresNetwork: false
      },
      {
        style: [styles.card, styles.cardPurple],
        text: "LUYỆN NGHE",
        subText: "THÔNG QUA TRẮC NGHIỆM VÀ TỰ LUẬN",
        image: require('../assets/images/Study_Music.png'),
        onPress: handleNavigateToListen,
        requiresNetwork: true
      },
      {
        style: [styles.card, styles.cardPink],
        text: "LUYỆN NÓI",
        subText: "THÔNG QUA CHAT BOT",
        image: require('../assets/images/Study_Speaking.png'),
        onPress: handleNavigateToVoiceAI,
        requiresNetwork: true
      },
      {
        style: [styles.card, styles.cardOrange],
        text: "KIỂM TRA TỪ VỰNG",
        subText: "THÔNG QUA TRẮC NGHIỆM",
        image: require('../assets/images/Study_Fav.png'),
        onPress: handleNavigateToTest,
        requiresNetwork: true
      },
      {
        style: [styles.card, styles.cardTeal],
        text: "GIẢI TRÍ",
        subText: "THÔNG QUA WORD GUESS",
        image: require('../assets/images/Study_Gaming.png'),
        onPress: handleNavigateToLevelWordGuess,
        requiresNetwork: true
      },
      {
        style: [styles.card, styles.cardPink],
        text: "GIẢI ĐÁP",
        subText: "THÔNG QUA CHAT BOT",
        image: require('../assets/images/Bot_Support.png'),
        onPress: handleNavigateToChatBot,
        requiresNetwork: true
      }
    ];

    return cards.map((card, index) => {
      if (!isOnline && card.requiresNetwork) {
        return (
          <TouchableOpacity 
            key={index}
            style={[...card.style, { opacity: 0.5 }]}
            disabled={true}
          >
            <Text style={styles.cardText}>{card.text}</Text>
            <Image source={card.image} style={styles.cardImage} />
            <Text style={styles.cardSubText}>{card.subText}</Text>
            <Text style={{
              color: 'red',
              fontSize: 12,
              textAlign: 'center',
              marginTop: 5,
              position: 'absolute',
              bottom: 40,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(255,255,255,0.8)',
              padding: 5
            }}>
              Tính năng không khả dụng khi offline
            </Text>
            <Icon name="arrow-forward" size={24} color="white" style={styles.cardIcon} />
          </TouchableOpacity>
        );
      }

      return (
        <TouchableOpacity 
          key={index}
          style={card.style}
          onPress={card.onPress}
        >
          <Text style={styles.cardText}>{card.text}</Text>
          <Image source={card.image} style={styles.cardImage} />
          <Text style={styles.cardSubText}>{card.subText}</Text>
          <Icon name="arrow-forward" size={24} color="white" style={styles.cardIcon} />
        </TouchableOpacity>
      );
    });
  };

  const renderPopularWords = () => {
    if (!isOnline) {
      return (
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}>
          <Text style={{
            color: 'white',
            textAlign: 'center',
            fontSize: 18,
            fontWeight: '500',
            padding: 20,
            textShadowColor: 'rgba(0, 0, 0, 0.75)',
            textShadowOffset: {width: -1, height: 1},
            textShadowRadius: 10
          }}>
            Bạn đang offline. Vui lòng kết nối mạng để xem từ vựng đ xuất.
          </Text>
        </View>
      );
    }

    return (
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
    );
  };

  const handleHideFeedback = async (feedbackId) => {
    try {
      const updatedHidden = [...hiddenFeedbacks, feedbackId];
      setHiddenFeedbacks(updatedHidden);
      await AsyncStorage.setItem(`HiddenFeedbacks_${userId}`, JSON.stringify(updatedHidden));
    } catch (error) {
      console.error('Error hiding feedback:', error);
    }
  };

  const handleHideAllFeedbacks = async () => {
    try {
      const allFeedbackIds = storedFeedbacks.map(feedback => feedback.FeedbackId);
      setHiddenFeedbacks(allFeedbackIds);
      await AsyncStorage.setItem(`HiddenFeedbacks_${userId}`, JSON.stringify(allFeedbackIds));
    } catch (error) {
      console.error('Error hiding all feedbacks:', error);
    }
  };

  useEffect(() => {
    const loadHiddenFeedbacks = async () => {
      try {
        const hidden = await AsyncStorage.getItem(`HiddenFeedbacks_${userId}`);
        if (hidden) {
          setHiddenFeedbacks(JSON.parse(hidden));
        }
      } catch (error) {
        console.error('Error loading hidden feedbacks:', error);
      }
    };
    
    if (userId) {
      loadHiddenFeedbacks();
    }
  }, [userId]);

  useEffect(() => {
    const newFilteredFeedbacks = storedFeedbacks
      .filter(feedback => !hiddenFeedbacks.includes(feedback.FeedbackId))
      .filter(feedback => {
        if (showAllNotifications) {
          return true;
        } else {
          return feedback.viewed === 0;
        }
      })
      .sort((a, b) => new Date(b.FeedbackCreatedAt) - new Date(a.FeedbackCreatedAt));
      
    setFilteredFeedbacks(newFilteredFeedbacks);

    const newUnreadCount = storedFeedbacks.filter(
      feedback => feedback.viewed === 0 && feedback.UserId === userId
    ).length;
    setUnreadCount(newUnreadCount);
  }, [storedFeedbacks, showAllNotifications, hiddenFeedbacks, userId]);

  useEffect(() => {
    const loadStoredFeedbacks = async () => {
      try {
        if (!userId) return;
        const stored = await AsyncStorage.getItem(`AdFeedback_${userId}`);
        const parsedStored = stored ? JSON.parse(stored) : [];
        setStoredFeedbacks(parsedStored);
        const unreadCount = parsedStored.filter(feedback => 
          feedback.viewed === 0 && feedback.UserId === userId
        ).length;
        setUnreadCount(unreadCount);
      } catch (error) {
        console.error('Error loading stored feedbacks:', error);
      }
    };

    if (userId) {
      loadStoredFeedbacks();
    }
  }, [userId]);

  useEffect(() => {
    const loadViewedFeedbacks = async () => {
      try {
        if (!userId) return;
        const stored = await AsyncStorage.getItem(`ViewedFeedbacks_${userId}`);
        if (stored) {
          const viewedIds = new Set(JSON.parse(stored));
          setViewedFeedbacks(viewedIds);
        }
      } catch (error) {
        console.error('Error loading viewed feedbacks:', error);
      }
    };

    loadViewedFeedbacks();
  }, [userId]);

  useEffect(() => {
    const saveViewedFeedbacks = async () => {
      try {
        if (!userId) return;
        await AsyncStorage.setItem(
          `ViewedFeedbacks_${userId}`, 
          JSON.stringify([...viewedFeedbacks])
        );
      } catch (error) {
        console.error('Error saving viewed feedbacks:', error);
      }
    };

    if (viewedFeedbacks.size > 0) {
      saveViewedFeedbacks();
    }
  }, [viewedFeedbacks, userId]);

  return (
    <TouchableWithoutFeedback onPress={handlePressOutside}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.languageText}>EasyEnglish</Text>
          <TouchableOpacity onPress={handleNotificationPress} style={styles.notificationContainer}>
            <Icon name="notifications" size={24} color="gray" style={styles.bellIcon} />
            {storedFeedbacks.filter(feedback => 
              feedback.viewed === 0 && feedback.UserId === userId
            ).length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {storedFeedbacks.filter(feedback => 
                    feedback.viewed === 0 && feedback.UserId === userId
                  ).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
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
            {renderStudyCards()}
          </ScrollView>
          <View style={styles.popularWordContainer}>
            <ImageBackground source={background} style={styles.backImage}>
              <Text style={styles.popularWordText}>ĐANG ĐƯỢC ĐỀ XUẤT HÔM NAY</Text>
              {renderPopularWords()}
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
        <Modal
          visible={showNotificationModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowNotificationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Thông báo</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {showAllNotifications && filteredFeedbacks.length > 0 && (
                    <TouchableOpacity
                      style={styles.deleteAllButton}
                      onPress={handleHideAllFeedbacks}
                    >
                      <Text style={styles.deleteAllText}>Xóa tất cả</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={toggleNotificationsView}
                  >
                    <Text style={styles.toggleButtonText}>
                      {showAllNotifications ? 'Chỉ hiện chưa đọc' : 'Hiện tất cả'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <FlatList
                data={filteredFeedbacks}
                renderItem={renderFeedbackItem}
                keyExtractor={(item, index) => `${item.FeedbackId}_${index}`}
                style={styles.feedbackList}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    {showAllNotifications 
                      ? 'Không có thông báo nào'
                      : 'Không có thông báo mới'}
                  </Text>
                }
              />

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowNotificationModal(false)}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};


export default Home;
