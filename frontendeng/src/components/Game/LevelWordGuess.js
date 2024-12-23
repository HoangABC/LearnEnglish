import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';

const LevelWordGuess = () => {
  const [selectedLevel, setSelectedLevel] = useState(2);
  const [tempLevel, setTempLevel] = useState(2); 
  const navigation = useNavigation();
  const [fadeAnim] = useState(new Animated.Value(1));
  const [currentText, setCurrentText] = useState('NORMAL');

  const handlePlayPress = () => {
    let level;
    if (selectedLevel < 1.5) {
      level = 'easy';
    } else if (selectedLevel < 2.5) {
      level = 'normal';
    } else {
      level = 'hard';
    }
    navigation.navigate('WordGuess', { selectedLevel: level });
  };

  const handleSlidingComplete = (value) => {
    let snappedValue;
    if (value < 1.5) {
      snappedValue = 1; 
    } else if (value < 2.5) {
      snappedValue = 2; 
    } else {
      snappedValue = 3; 
    }
    setSelectedLevel(snappedValue);
    setTempLevel(snappedValue);
  };

  const updateLevelText = (value) => {

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {

      if (value < 1.5) {
        setCurrentText('EASY');
      } else if (value < 2.5) {
        setCurrentText('NORMAL');
      } else {
        setCurrentText('HARD');
      }
      

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  useEffect(() => {
    updateLevelText(tempLevel);
  }, [tempLevel]);

  const getTrackColor = () => {
    if (tempLevel < 1.5) {
      return '#94C759'; 
    } else if (tempLevel < 2.5) {
      return '#FFA500'; 
    } else {
      return '#FF5733'; 
    }
  };

  const getThumbColor = () => {
    return '#FFDD00';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WORD GUESS</Text>
      <Text style={styles.instructions}>
        Guess the five-letter word in six tries by entering words and receiving feedback on the letters that match the target word in the correct position (green) or are included but in the wrong position! (yellow).
      </Text>

      <Animated.Text 
        style={[
          styles.levelText,
          {
            opacity: fadeAnim
          }
        ]}
      >
        {currentText}
      </Animated.Text>

      <View style={styles.trackContainer}>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={3}
          step={0.1}
          value={tempLevel}
          onValueChange={(value) => setTempLevel(value)}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor={getTrackColor()} 
          maximumTrackTintColor="#E0E0E0" 
          thumbTintColor={getThumbColor()} 
          trackStyle={styles.trackStyle} 
        />
      </View>

      <TouchableOpacity style={styles.playButton} onPress={handlePlayPress}>
        <Text style={styles.playButtonText}>PLAY</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#4169E1',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  instructions: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    color: '#555',
    marginBottom: 40,
    fontWeight: '600',
    paddingHorizontal: 20,
  },
  trackContainer: {
    width: '85%',
    maxWidth: 350,
    height: 60,
    borderWidth: 3,
    borderColor: '#E8E8E8',
    borderRadius: 30,
    justifyContent: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  slider: {
    width: '100%',
    height: 50,
  },
  trackStyle: {
    height: 10,
    borderRadius: 5,
  },
  levelText: {
    fontSize: 36,
    marginVertical: 25,
    fontWeight: '800',
    color: '#FF6B6B',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  playButton: {
    marginTop: 40,
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  playButtonText: {
    fontSize: 24,
    color: '#000',
    fontWeight: '800',
    letterSpacing: 1,
  },
});

export default LevelWordGuess;
