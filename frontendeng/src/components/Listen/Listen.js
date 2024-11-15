import React, { useEffect, useState } from 'react'; 
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import useListen from '../../hooks/useListen';
import { WebView } from 'react-native-webview'; 

const Listen = () => {
  const { listeningPracticeData, error, fetchPractice, submitPractice } = useListen();
  const [userId, setUserId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [soundUrl, setSoundUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [webviewKey, setWebviewKey] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const fetchUserId = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserId(user.Id);
      } else {
        console.error("User not found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error fetching userId from AsyncStorage:", error);
    }
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchPractice(userId);
    }
  }, [userId]);

  const playSound = (audioUrl) => {
    if (!audioUrl) return;
    setSoundUrl(audioUrl);
    setWebviewKey(prevKey => prevKey + 1);
    setIsPlaying(true);
  };

  const handleAudioPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      playSound(listeningPracticeData.audio);
    }
  };

  const handleAnswerSelection = (questionId, answer) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: answer }));
  };

  const handleSubmit = () => {
    const currentAnswer = answers[listeningPracticeData.questionId];
    
    if (currentAnswer === listeningPracticeData.word) {
      setModalMessage('You are correct! Press OK to continue.');
    } else {
      setModalMessage(`Incorrect. The correct word is: ${listeningPracticeData.word}. Press OK to continue.`);
    }
    setModalVisible(true);
  
    if (userId) {
      submitPractice(userId, currentAnswer);
    } else {
      console.error('User ID is not available');
    }
  };

  if (error) {
    const errorMessage = typeof error === 'string' ? error : JSON.stringify(error);
    return <Text style={styles.errorText}>Error: {errorMessage}</Text>;
  }

  if (!listeningPracticeData) {
    return <Text style={styles.errorText}>Loading question...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Luyện nghe</Text>
      <ScrollView style={styles.questionContainer}>
        {listeningPracticeData.audio && (
          <View style={styles.audioContainer}>
            <TouchableOpacity onPress={handleAudioPlay}>
              <Text style={styles.audioButton}>{isPlaying ? 'Pause' : 'Play'} Audio</Text>
            </TouchableOpacity>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100} // Duration is no longer needed here since WebView does not provide current position tracking like Sound
              value={isPlaying ? 50 : 0} // This is a placeholder, as WebView doesn't provide precise tracking
              minimumTrackTintColor="#1E90FF"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#1E90FF"
            />
          </View>
        )}
      </ScrollView>

      {soundUrl && (
        <View style={{ height: 0 }}>
          <WebView
            key={webviewKey}
            source={{ uri: soundUrl }}
            style={{ height: 0, width: 0, opacity: 0 }}
            onLoad={() => console.log('WebView Loaded')}
            onError={() => console.error('WebView Error')}
          />
        </View>
      )}

      <View style={styles.optionsContainer}>
        {listeningPracticeData.inputType === 'fill-in-the-blank' ? (
          <TextInput
            style={styles.textInput}
            placeholder="Type your answer"
            onChangeText={(text) => handleAnswerSelection(listeningPracticeData.questionId, text)}
          />
        ) : (
          listeningPracticeData.choices.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.optionButton, answers[listeningPracticeData.questionId] === option && styles.selectedOptionButton]}
              onPress={() => handleAnswerSelection(listeningPracticeData.questionId, option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Answer</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity onPress={() => {
              setModalVisible(false);
              fetchPractice(userId);
            }}>
              <Text style={styles.modalButton}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: 20,
  },
  audioContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  audioButton: {
    color: 'blue',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  optionsContainer: {
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedOptionButton: {
    backgroundColor: '#1E90FF',
  },
  optionText: {
    textAlign: 'center',
    fontSize: 16,
    width:'100%',
  },
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#1E90FF',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    color: '#1E90FF',
    fontSize: 16,
  },
});

export default Listen;