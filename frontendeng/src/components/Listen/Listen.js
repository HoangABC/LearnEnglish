import React, { useEffect, useState } from 'react'; 
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import useListen from '../../hooks/useListen';
import { WebView } from 'react-native-webview'; 
import Sound from 'react-native-sound'; 
import Icon from 'react-native-vector-icons/MaterialIcons';


const Listen = () => {
  const { listeningPracticeData, error, fetchPractice, submitPractice } = useListen();
  const [userId, setUserId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [soundUrl, setSoundUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [webviewKey, setWebviewKey] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isPaused, setIsPaused] = useState(true);  // Initially set to paused

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

  // Function to play the local sound
  const SoundCorrect = (filePath) => {
    const sound = new Sound(require('../../assets/audios/correct.mp3'), (error) => {
      if (error) {
        console.error('Error loading sound:', error);
        return;
      }
      sound.play((success) => {
        if (success) {
          console.log('Successfully played sound');
        } else {
          console.error('Playback failed');
        }
      });
    });
  };

  const playSound = (audioUrl) => {
    if (!audioUrl) return;
  
    // Bắt đầu phát âm thanh
    setSoundUrl(audioUrl);
    setWebviewKey((prevKey) => prevKey + 1);
    setIsPlaying(true);
  
    const audioDuration = 4000;
  
    setTimeout(() => {
      setIsPlaying(false);
    }, audioDuration);
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
    
    const normalizedAnswer = listeningPracticeData.inputType === 'fill-in-the-blank'
      ? currentAnswer.trim().toLowerCase()
      : currentAnswer;
  
    const correctAnswer = listeningPracticeData.word.trim().toLowerCase(); 
    
    if (normalizedAnswer === correctAnswer) {
      SoundCorrect('../../assets/audios/correct.mp3');  
      setIsPaused(false); 
      setModalMessage('You are correct! Press OK to continue.');
    } else {
      setIsPaused(true); 
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

  const giphyHtmlPaused = `
  <div style="width:100%;height:53%;padding-bottom:50%;position:relative;">
   <img src="https://media.giphy.com/media/XKMPsmeTX6N6WlzI4c/giphy_s.gif" 
     style="width:70%;height:98%;position:absolute;left:1%;bottom:3%" 
     alt="Static GIPHY" />
  </div>
`;

  const giphyHtmlActive = `
  <div style="width:100%;height:50%;padding-bottom:50%;position:relative;right:15%">
    <iframe src="https://giphy.com/embed/XKMPsmeTX6N6WlzI4c" 
            width="100%" 
            height="100%" 
            style="position:absolute;" 
            frameBorder="0" 
            class="giphy-embed" 
            allowFullScreen>
    </iframe>
  </div>
`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Luyện nghe</Text>
      <ScrollView style={styles.questionContainer}>
        <View style={styles.rowContainer}>
          <View style={styles.webViewContainer}>
            <WebView
              originWhitelist={['*']}
              source={{ html: isPaused ? giphyHtmlPaused : giphyHtmlActive }} 
              style={{ height: 300, backgroundColor: 'transparent' }} 
            />
          </View>
          <View style={styles.audioItem}>
            {listeningPracticeData.audio && (
              <View style={styles.speechBubbleContainer}>
                <View style={[styles.audioContainer, { zIndex: 1 }]}>
                  <TouchableOpacity onPress={handleAudioPlay}>
                  <Icon name="volume-up" size={30} color="black" />
                </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
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
            value={inputValue}
            onChangeText={(text) => {
              setInputValue(text);
              handleAnswerSelection(listeningPracticeData.questionId, text);
            }}
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
              setInputValue('');  
              setIsPaused(true);  
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
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',  
    alignItems: 'flex-start',        
  },
  audioItem: {
    flex: 1,  
    marginRight: 10,
    marginTop:'25%', 

  },
  webViewContainer: {
    flex: 1,  
    height: 300,
  },
  audioButton: {
    color: 'blue',
    marginBottom: 10,
  },
  speechBubbleContainer: {
    backgroundColor: '#f9f9f9', 
    borderRadius: 10,
    padding: 10,
    position: 'relative',
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'flex-start', 
    maxWidth: '80%', 
    
  },
  webView: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
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
    zIndex: 1, // Ensure it stays above the WebView
  },
  audioButton: {
    color: 'blue',
    marginBottom: 10,
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
    width: '100%',
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
    position: 'absolute',  // Fix it at the bottom of the screen
    bottom: 0,  // Position the modal one-third from the bottom
    left: 0,
    right: 0,
    justifyContent: 'flex-end', // Align the modal content at the bottom
    alignItems: 'center',
    paddingBottom: 30,  // Padding to avoid clipping at the screen edge
    backgroundColor: 'transparent',  // Remove the overlay background
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '100%',  // Adjust the width to fit the content properly
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign:'center',
  },
  modalButton: {
    color: '#1E90FF',
    width:200,
    textAlign:'center',
  },
  speechBubbleContainer: {
    backgroundColor: '#f9f9f9', 
    borderRadius: 10,
    padding: 10,
    position: 'relative',
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'flex-start', 
    maxWidth: '80%', 
  },
});

export default Listen;
