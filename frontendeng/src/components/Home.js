import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Svg, { Circle, G } from 'react-native-svg';
import styles from '../styles/HomeStyles';
import useWordActions from '../hooks/useWordActions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState(null);
  const [duration, setDuration] = useState(5);
  const [userId, setUserId] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const { status, error, searchResults, handleSearchWord, clearSearchResults } = useWordActions();


  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const { id } = JSON.parse(user);
          setUserId(id);

          const savedStartTime = await AsyncStorage.getItem(`startTime_${id}`);
          const savedDuration = await AsyncStorage.getItem(`duration_${id}`);
          const savedRemainingTime = await AsyncStorage.getItem(`remainingTime_${id}`);
          const savedProgress = await AsyncStorage.getItem(`progress_${id}`);

          if (savedStartTime && savedDuration && savedRemainingTime && savedProgress) {
            const startTime = parseInt(savedStartTime);
            const duration = parseInt(savedDuration);
            const savedRemaining = parseFloat(savedRemainingTime);
            const elapsedTime = (Date.now() - startTime) / 1000 / 60;

            const remaining = savedRemaining - elapsedTime;
            setRemainingTime(remaining);

            if (remaining > 0) {
              setProgress(parseFloat(savedProgress));
              startTimer(remaining, startTime);
            } else {
              setProgress(1);
            }
          } else {
            startTimer(duration, Date.now());
          }
        }
      } catch (error) {
        console.error("Failed to load user data", error);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (progress > 0 && userId) {
      AsyncStorage.setItem(`progress_${userId}`, progress.toString());
      AsyncStorage.setItem(`remainingTime_${userId}`, remainingTime?.toString() ?? '0');
    }
  }, [progress, remainingTime, userId]);

  const startTimer = (time, startTime) => {
    const durationInMillis = time * 60 * 1000;
    if (userId) {
      AsyncStorage.setItem(`startTime_${userId}`, startTime.toString());
      AsyncStorage.setItem(`duration_${userId}`, time.toString());
    }

    if (timer) clearInterval(timer);

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationInMillis, 1);
      const newRemainingTime = time - elapsed / 1000 / 60;

      setProgress(progress);
      setRemainingTime(newRemainingTime);

      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 1000);

    setTimer(interval);
  };

  const handleSelectTime = (time) => {
    setShowTimePicker(false);
    setDuration(time);

    const newRemainingTime = remainingTime + (time - duration);
    setRemainingTime(newRemainingTime);
    const newStartTime = Date.now() - ((duration - newRemainingTime) * 60 * 1000);

    startTimer(newRemainingTime, newStartTime);
  };

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
  };

  const handlePressOutside = () => {
    setShowDropdown(false);
    setKeyword('');
    Keyboard.dismiss();
  };

  const radius = 20;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progress);

  const limitedSearchResults = searchResults.slice(0, 10);

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
            <View style={styles.settingsContainer}>
              <Text style={styles.settingsText}>Cài đặt</Text>
              <Icon name="settings" size={24} color="gray" style={styles.settingsIcon} />
            </View>
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
                        key={item.Id}
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
            <TouchableOpacity style={styles.card}>
              <Text style={styles.cardText}>HỌC TỪ VỰNG</Text>
              <Image
                source={require('../assets/images/Study_Voca.png')}
                style={styles.cardImage}
              />
              <Text style={styles.cardSubText}>THÔNG QUA FLASHCARD</Text>
              <Icon name="arrow-forward" size={24} color="white" style={styles.cardIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, styles.cardGreen]}>
              <Text style={styles.cardText}>HỌC NGỮ PHÁP</Text>
              <Text style={styles.cardSubText}>QUA VÍ DỤ</Text>
              <Icon name="arrow-forward" size={24} color="white" style={styles.cardIcon} />
            </TouchableOpacity>
          </ScrollView>
      
          <TouchableOpacity 
            style={styles.timerButton} 
            onPress={() => setShowTimePicker(true)}
          >
            <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
              <G rotation="-90" origin={`${radius + strokeWidth / 2}, ${radius + strokeWidth / 2}`}>
                <Circle
                  cx={radius + strokeWidth / 2}
                  cy={radius + strokeWidth / 2}
                  r={radius}
                  stroke="#e6e6e6"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                <Circle
                  cx={radius + strokeWidth / 2}
                  cy={radius + strokeWidth / 2}
                  r={radius}
                  stroke="blue"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  fill="none"
                  strokeLinecap="round"
                />
              </G>
              <Icon name="local-fire-department" size={25} color="red" style={styles.fireIcon} />
            </Svg>
          </TouchableOpacity>
          <Modal
            animationType="slide"
            transparent={true}
            visible={showTimePicker}
          >
            <TouchableWithoutFeedback onPress={() => setShowTimePicker(false)}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  {[5, 10, 15].map((time) => (
                    <TouchableOpacity key={time} style={styles.timeOption} onPress={() => handleSelectTime(time)}>
                      <Text style={styles.timeText}>{time} phút</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
          </View>
        

        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Home;
