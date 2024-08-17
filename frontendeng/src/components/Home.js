import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Svg, { Circle, G } from 'react-native-svg';
import styles from '../styles/HomeStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState(null);
  const [duration, setDuration] = useState(5); // Default duration in minutes
  const [userId, setUserId] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const { id } = JSON.parse(user);
          setUserId(id);

          const savedStartTime = await AsyncStorage.getItem(`startTime_${id}`);
          const savedDuration = await AsyncStorage.getItem(`duration_${id}`);
          const savedProgress = await AsyncStorage.getItem(`progress_${id}`);

          if (savedStartTime && savedDuration && savedProgress) {
            const startTime = parseInt(savedStartTime);
            const duration = parseInt(savedDuration);
            const elapsedTime = (Date.now() - startTime) / 1000 / 60; // in minutes

            const remaining = duration - elapsedTime;
            setRemainingTime(remaining);

            if (remaining > 0) {
              setProgress(parseFloat(savedProgress));
              startTimer(remaining, startTime);
            } else {
              setProgress(1); // Timer completed
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
    }
  }, [progress, userId]);

  const startTimer = (time, startTime) => {
    const durationInMillis = time * 60 * 1000; // Convert minutes to milliseconds
    AsyncStorage.setItem(`startTime_${userId}`, startTime.toString());
    AsyncStorage.setItem(`duration_${userId}`, time.toString());

    if (timer) clearInterval(timer);

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationInMillis, 1);

      setProgress(progress);

      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 1000); // Update every second

    setTimer(interval);
  };

  const handleSelectTime = (time) => {
    setShowTimePicker(false);
    setDuration(time);

    const newRemainingTime = remainingTime + (time - duration); // Adjust the remaining time by the difference
    setRemainingTime(newRemainingTime);
    const newStartTime = Date.now() - ((duration - newRemainingTime) * 60 * 1000); // Adjust the start time accordingly

    startTimer(newRemainingTime, newStartTime);
  };

  const radius = 20;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progress);

  return (
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
          />
        </View>
      </View>
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
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.timeSelector}>
            <Text style={styles.selectorLabel}>Chọn thời gian:</Text>
            {[5, 10, 15, 20, 30].map((time) => (
              <TouchableOpacity key={time} style={styles.optionButton} onPress={() => handleSelectTime(time)}>
                <Text style={styles.optionText}>{time} phút</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Home;
