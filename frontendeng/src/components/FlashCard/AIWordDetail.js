import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  TouchableOpacity 
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { GEMINI_API_KEY, GEMINI_API_URL } from '@env';
import Tts from 'react-native-tts';
import LottieView from 'lottie-react-native';

const AIWordDetail = () => {
  const route = useRoute();
  const { word } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [wordData, setWordData] = useState(null);
  const [soundUrl, setSoundUrl] = useState(null);
  const [webviewKey, setWebviewKey] = useState(0);
  const [delayComplete, setDelayComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayComplete(true);
      fetchWordDataFromAI(word);
    }, 5000);

    return () => clearTimeout(timer);
  }, [word]);

  const fetchWordDataFromAI = async (word) => {
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
                text: `Please provide detailed information about the English word "${word}" in this exact JSON format:
                {
                  "word": "${word}",
                  "phoneticUK": "UK phonetic",
                  "phoneticUS": "US phonetic",
                  "definitions": [
                    {
                      "partOfSpeech": "noun/verb/adj/etc",
                      "definition": "Vietnamese definition",
                      "examples": [
                        {
                          "english": "Example in English",
                          "vietnamese": "Example in Vietnamese"
                        }
                      ]
                    }
                  ]
                }
                
                Requirements:
                1. Provide real phonetics with IPA symbols
                2. Include at least 2 example sentences with Vietnamese translations
                3. All Vietnamese text must be in proper Vietnamese
                4. Keep JSON format exactly as shown
                5. Each definition should have at least 2 examples
                6. Make sure all Vietnamese translations are natural and accurate`
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
        try {
          const jsonStr = data.candidates[0].content.parts[0].text;
          const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsedData = JSON.parse(jsonMatch[0]);
            setWordData(parsedData);
          }
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
        }
      }
    } catch (error) {
      console.error('Error fetching AI data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const speakWord = async (text, accent) => {
    try {
      const voices = await Tts.voices();

      Tts.setDefaultRate(0.4);
      Tts.setDefaultPitch(1.0);

      const preferredVoice = voices.find(v => v.id === 'en-US-SMTf00');
      if (preferredVoice) {
        await Tts.setDefaultVoice(preferredVoice.id);
      } else {

        await Tts.setDefaultVoice('en-US-default');
      }

      Tts.speak(text);
    } catch (error) {
      console.error('TTS Error:', error);
    }
  };

  Tts.voices().then(voices => {
    console.log('Available voices:', voices);
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require('../../assets/animations/LOADING.json')}
          autoPlay
          loop
          style={styles.lottieAnimation}
        />
        <Text style={styles.loadingText}>
          {!delayComplete 
            ? "Đang chuẩn bị..." 
            : `Đang tải thông tin từ "${word}"...`
          }
        </Text>
      </View>
    );
  }

  if (!wordData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Không thể tải thông tin cho từ "{word}". Vui lòng thử lại sau.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <View style={styles.wordHeader}>
          <Text style={styles.wordText}>
            {capitalizeFirstLetter(wordData.word)}
          </Text>
        </View>
        
        <View style={styles.phoneticsContainer}>
          <View style={styles.phoneticItem}>
            <Text style={styles.phoneticText}>IPA: {wordData.phoneticUK}</Text>
            <TouchableOpacity 
              onPress={() => speakWord(wordData.word)}
            >
              <Text style={styles.audioLink}>🔊 Pronunciation</Text>
            </TouchableOpacity>
          </View>
        </View>

        {wordData.definitions.map((def, index) => (
          <View key={index}>
            <Text style={styles.partOfSpeech}>
              {capitalizeFirstLetter(def.partOfSpeech)}
            </Text>
            <Text style={styles.definitionText}>{def.definition}</Text>
            
            {def.examples.map((example, exIndex) => (
              <View key={exIndex} style={styles.examplePair}>
                <View style={styles.exampleRow}>
                  <Image 
                    source={require('../../assets/images/EN.jpg')} 
                    style={styles.flag} 
                  />
                  <Text style={styles.exampleText}>
                    {example.english}
                  </Text>
                </View>
                <View style={styles.exampleRow}>
                  <Image 
                    source={require('../../assets/images/VN.png')} 
                    style={styles.flag} 
                  />
                  <Text style={styles.exampleText}>
                    {example.vietnamese}
                  </Text>
                </View>
                <View style={styles.divider} />
              </View>
            ))}
          </View>
        ))}
      </View>

      {soundUrl && (
        <View style={{ height: 0 }}>
          <WebView
            key={webviewKey}
            source={{ uri: soundUrl }}
            style={{ height: 0, width: 0, opacity: 0 }}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    width:'100%',
    textAlign:'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
  wordHeader: {
    marginBottom: 20,
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  phoneticsContainer: {
    marginBottom: 20,
  },
  phoneticItem: {
    marginBottom: 15,
  },
  phoneticText: {
    fontSize: 18,
    color: '#555',
  },
  audioLink: {
    color: '#0066cc',
    fontSize: 16,
    marginTop: 5,
    textDecorationLine: 'underline',
  },
  partOfSpeech: {
    fontSize: 20,
    color: '#666',
    fontStyle: 'italic',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  definitionText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  examplePair: {
    marginBottom: 10,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  flag: {
    width: 24,
    height: 16,
    marginRight: 8,
  },
  exampleText: {
    fontSize: 16,
    color: '#777',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
});

export default AIWordDetail; 