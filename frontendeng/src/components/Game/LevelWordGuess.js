import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';

const LevelWordGuess = () => {
  const [selectedLevel, setSelectedLevel] = useState(2); // Default 'Normal'
  const [tempLevel, setTempLevel] = useState(2); // For temporary value
  const navigation = useNavigation();

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
      snappedValue = 1; // Snap to Easy
    } else if (value < 2.5) {
      snappedValue = 2; // Snap to Normal
    } else {
      snappedValue = 3; // Snap to Hard
    }
    setSelectedLevel(snappedValue);
    setTempLevel(snappedValue);
  };

  // Color for track and thumb based on difficulty
  const getTrackColor = () => {
    if (tempLevel < 1.5) {
      return '#94C759'; // Green for Easy
    } else if (tempLevel < 2.5) {
      return '#FFA500'; // Orange for Medium
    } else {
      return '#FF5733'; // Red for Hard
    }
  };

  const getThumbColor = () => {
    return '#FFDD00'; // Consistent thumb color
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WORD GUESS</Text>
      <Text style={styles.instructions}>
        Guess the five-letter word in six tries by entering words and receiving feedback on the letters that match the target word in the correct position (green) or are included but in the wrong position! (yellow).
      </Text>

      {/* Slider border */}
      <View style={styles.trackContainer}>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={3}
          step={0.1}
          value={tempLevel}
          onValueChange={(value) => setTempLevel(value)}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor={getTrackColor()} // Track color based on level
          maximumTrackTintColor="#E0E0E0" // Lighter track for unselected areas
          thumbTintColor={getThumbColor()} // Thumb color
          trackStyle={styles.trackStyle} // Apply custom track style
        />
      </View>

      {/* Show selected difficulty */}
      <Text style={styles.levelText}>
        {tempLevel < 1.5 ? 'EASY' : tempLevel < 2.5 ? 'NORMAL' : 'HARD'}
      </Text>

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
    backgroundColor: '#F5DEB3',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFDD00',
    marginBottom: 10,
  },
  instructions: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  trackContainer: {
    width: 300,
    height: 50, // Height of trackContainer
    borderWidth: 5, // Border around track
    borderColor: '#d3d3d3', // Border color
    borderRadius: 25, // Border radius
    justifyContent: 'center', // Center the slider vertically
    backgroundColor: 'transparent', // Transparent background
  },
  slider: {
    width: '100%',
    height: 40, // Increase height of the slider to make it thicker
  },
  trackStyle: {
    height: 8, // Set height of the track
    borderRadius: 4, // Rounded corners for the track
  },
  thumb: {
    height: 30, // Height of the thumb
    width: 30, // Width of the thumb
    borderRadius: 15, // Rounded thumb
    backgroundColor: '#FFDD00', // Color of the thumb
  },
  levelText: {
    fontSize: 22,
    marginVertical: 15,
    fontWeight: 'bold',
    color: '#FF5733',
  },
  playButton: {
    marginTop: 20,
    backgroundColor: '#FFDD00',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  playButtonText: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
});

export default LevelWordGuess;
