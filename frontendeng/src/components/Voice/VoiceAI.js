import React, { useState, useEffect } from 'react';
import { Button, Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import Voice from '@wdragon/react-native-voice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Tts from 'react-native-tts';
import { GEMINI_API_KEY, GEMINI_API_URL } from '@env';

const VoiceAI = () => {
  const [recognizedText, setRecognizedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsReady, setTtsReady] = useState(false);
  const [vietnameseFeedback, setVietnameseFeedback] = useState('');
  const [isVietnameseExpanded, setIsVietnameseExpanded] = useState(false);

  useEffect(() => {
    const initTts = async () => {
      try {
        await Tts.getInitStatus();
        const voices = await Tts.voices();
        console.log('Available voices:', voices);

        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultVoice('en-US-default');
        await Tts.setDefaultRate(0.48);
        await Tts.setDefaultPitch(1.0);
        
        setTtsReady(true);
        console.log('TTS initialized successfully');
      } catch (err) {
        console.error('TTS initialization failed:', err);
      }
    };

    initTts();

    // Voice recognition listeners
    Voice.onSpeechStart = () => console.log('Speech started');
    Voice.onSpeechEnd = () => {
      console.log('Speech ended');
      setIsListening(false);
    };
    Voice.onSpeechResults = (event) => {
      const text = event.value[0];
      setRecognizedText(text);
      checkPronunciation(text);
    };

    return () => {
      Voice.destroy().catch(() => {});
      Voice.onSpeechStart = null;
      Voice.onSpeechEnd = null;
      Voice.onSpeechResults = null;

      if (isSpeaking) {
        Tts.stop();
      }
    };
  }, []);

  useEffect(() => {
    const handleTtsFinish = () => {
      setIsSpeaking(false);
    };

    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultVoice('en-US-default');
    
    return () => {
      if (isSpeaking) {
        Tts.stop();
      }
    };
  }, [isSpeaking]);

  useEffect(() => {
    if (feedback && !isLoading && ttsReady) {
      const timer = setTimeout(() => {
        speak(feedback);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [feedback, isLoading, ttsReady]);

  useEffect(() => {
    if (feedback && !isLoading) {
      translateFeedback(feedback);
    }
  }, [feedback, isLoading]);

  const checkPronunciation = async (text) => {
    if (!text) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a professional, friendly and fun pronunciation coach. Your student just said: "${text}"

                Response requirements:
                1. Focus on pronunciation only, using simple English
                2. Structure your response like this:
                   - Give a quick, simple praise
                   - Check pronunciation of each word
                   - For any wrong sounds, write "[PRONOUNCE]" and explain how to make the sound using mouth/tongue position
                   - Give a simple practice tip
                3. If NOT English: Only respond "Please speak in English so I can evaluate."

                Example of a good response:
                "Good try! Let's work on your pronunciation.

                The word "thank" needs practice:
                [PRONOUNCE] thank
                - Put your tongue between your teeth for "th"
                - Then say "ank" like in "bank"
                
                Practice tip: Put your finger in front of your mouth - you should feel air on your finger for "th".
                Try saying: th... th... thank... thank..."`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      const data = await response.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        let feedback = data.candidates[0].content.parts[0].text;
        
        if (typeof feedback === 'string') {
          feedback = feedback.trim();
          setFeedback(feedback);
        } else {
          setFeedback('Sorry, there was an error processing the feedback. Please try again.');
        }
      } else {
        setFeedback('Sorry, I cannot evaluate at this moment. Please try again!');
      }
    } catch (error) {
      console.error('Error:', error);
      setFeedback('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const translateFeedback = async (englishText) => {
    try {
      const response = await fetch(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Translate this English feedback to Vietnamese, keeping the same structure and meaning:
                "${englishText}"`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      const data = await response.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        setVietnameseFeedback(data.candidates[0].content.parts[0].text.trim());
      }
    } catch (error) {
      console.error('Translation error:', error);
      setVietnameseFeedback('Không thể dịch phản hồi lúc này.');
    }
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      await Voice.start('en-US');
    } catch (error) {
      console.error(error);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error(error);
    }
  };

  const speak = async (text) => {
    try {
      if (!ttsReady) {
        console.log('TTS not ready yet');
        return;
      }

      if (isSpeaking) {
        await Tts.stop();
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setIsSpeaking(true);

      // Nếu là hướng dẫn phát âm (có chứa [PRONOUNCE])
      if (text.includes('[PRONOUNCE]')) {
        // Tách các câu và thêm khoảng dừng
        const sentences = text.split('\n').map(sentence => sentence.trim());

        for (const sentence of sentences) {
          if (isSpeaking) {
            await Tts.stop();
          }

          // Thêm khoảng dừng dài hơn cho phần hướng dẫn phát âm
          if (sentence.includes('[PRONOUNCE]')) {
            await Tts.setDefaultRate(0.4);
            await Tts.speak(sentence.replace('[PRONOUNCE]', ''), {
              onDone: () => setIsSpeaking(false),
              onError: () => setIsSpeaking(false)
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            await Tts.setDefaultRate(0.45);
            await Tts.speak(sentence, {
              onDone: () => setIsSpeaking(false),
              onError: () => setIsSpeaking(false)
            });
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      } else {
        // Với text bình thường
        await Tts.setDefaultRate(0.48);
        await Tts.speak(text, {
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false)
        });
      }

    } catch (error) {
      console.error('TTS Error:', error);
      setIsSpeaking(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pronunciation Practice</Text>
      </View>

      <ScrollView 
        style={styles.mainContent} 
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Recognized Speech:</Text>
          <View style={styles.recognizedTextContainer}>
            <Text style={styles.recognizedText}>{recognizedText || '(No speech detected)'}</Text>
            {recognizedText && (
              <TouchableOpacity style={styles.speakButton} onPress={() => speak(recognizedText)}>
                <Icon name="volume-up" size={24} color="#2196F3" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackLabel}>Feedback (English):</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#2196F3" />
          ) : (
            <Text style={styles.feedbackText}>{feedback || '(No feedback available)'}</Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.feedbackContainer}
          onPress={() => setIsVietnameseExpanded(!isVietnameseExpanded)}
        >
          <View style={styles.vietnameseFeedbackHeader}>
            <Text style={styles.feedbackLabel}>Phản hồi (Tiếng Việt)</Text>
            <Icon 
              name={isVietnameseExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
              size={24} 
              color="#666"
            />
          </View>
          
          {isVietnameseExpanded && (
            isLoading ? (
              <ActivityIndicator size="large" color="#2196F3" />
            ) : (
              <Text style={[styles.feedbackText, styles.vietnameseFeedbackText]}>
                {vietnameseFeedback || '(Chưa có phản hồi)'}
              </Text>
            )
          )}
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.micButton, isListening && styles.micButtonActive]}
        onPress={isListening ? stopListening : startListening}
      >
        <Icon name={isListening ? 'mic' : 'mic-none'} size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
    elevation: 4,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  resultContainer: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  recognizedTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recognizedText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
    width: '80%',
  },
  speakButton: {
    padding: 8,
  },
  feedbackContainer: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  feedbackLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    width: '80%',
  },
  feedbackText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  micButton: {
    backgroundColor: '#2196F3',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 30,
    right: 30,
    elevation: 5,
  },
  micButtonActive: {
    backgroundColor: '#f44336',
  },
  spacer: {
    height: 80,
  },
  vietnameseFeedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  vietnameseFeedbackText: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});

export default VoiceAI;
