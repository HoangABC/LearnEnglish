import React, { useEffect, useState } from 'react';    
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import useWordActions from '../../hooks/useWordActions';
import { WebView } from 'react-native-webview';

const WordDetail = () => {
  const route = useRoute();
  const { wordId } = route.params;
  const { handleGetWord, wordDetail } = useWordActions();

  const [soundUrl, setSoundUrl] = useState(null);
  const [webviewKey, setWebviewKey] = useState(0);

  // Quản lý trạng thái số lượng ví dụ hiển thị cho mỗi từ theo chỉ mục
  const [visibleExamples, setVisibleExamples] = useState({});

  useEffect(() => {
    if (wordId) {
      handleGetWord(wordId);
    }
  }, [wordId]);

  const playSound = (audioUrl) => {
    if (!audioUrl) return;
    setSoundUrl(audioUrl);
    setWebviewKey(prevKey => prevKey + 1);
  };

  // Tạo hàm xử lý cho mỗi phần riêng biệt, truyền theo chỉ số index
  const formatExamplesWithTranslations = (example, exampleVI, index) => {
    if (!example || !exampleVI) return null;

    const cleanedExample = example.replace(/<\/?li[^>]*>/g, '').replace(/<[^>]+>/g, '');
    const cleanedExampleVI = exampleVI.replace(/<\/?li[^>]*>/g, '').replace(/<[^>]+>/g, '');

    const englishExamples = cleanedExample.split(';').map(e => e.trim());
    const vietnameseExamples = cleanedExampleVI.split(';').map(e => e.trim());

    const pairedExamples = englishExamples.map((example, i) => ({
      english: example,
      vietnamese: vietnameseExamples[i] || ''
    }));

    const currentVisible = visibleExamples[index] || 1;

    return (
      <>
        {pairedExamples.slice(0, currentVisible).map((examplePair, i) => (
          <View key={i} style={styles.examplePair}>
            <View style={styles.exampleRow}>
              <Image source={require('../../assets/images/EN.jpg')} style={styles.flag} />
              <Text style={styles.exampleText}>{examplePair.english}</Text>
            </View>
            <View style={styles.exampleRow}>
              <Image source={require('../../assets/images/VN.png')} style={styles.flag} />
              <Text style={styles.exampleText}>{examplePair.vietnamese}</Text>
            </View>
            {/* Đường gạch ngang giữa các cặp câu ví dụ */}
            <View style={styles.divider} />
          </View>
        ))}
        {currentVisible < pairedExamples.length && (
          <TouchableOpacity onPress={() => setVisibleExamples({
            ...visibleExamples,
            [index]: currentVisible + 1
          })}>
            <Text style={styles.showMoreButton}>Xem thêm</Text>
          </TouchableOpacity>
        )}
      </>
    );
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {wordDetail && Array.isArray(wordDetail) ? (
        <View>
          <Text style={styles.wordText}>{capitalizeFirstLetter(wordDetail[0].Word)}</Text>
          <View style={styles.phoneticsContainer}>
            <Text style={styles.phoneticText}>UK: {capitalizeFirstLetter(wordDetail[0].PhoneticUK)}</Text>
            <TouchableOpacity onPress={() => playSound(wordDetail[0].AudioUK)}>
              <Text style={styles.audioLink}>🔊 UK Pronunciation</Text>
            </TouchableOpacity>

            <Text style={styles.phoneticText}>US: {capitalizeFirstLetter(wordDetail[0].PhoneticUS)}</Text>
            <TouchableOpacity onPress={() => playSound(wordDetail[0].AudioUS)}>
              <Text style={styles.audioLink}>🔊 US Pronunciation</Text>
            </TouchableOpacity>
          </View>

          {wordDetail.map((word, index) => (
            <View key={index}>
              <Text style={styles.partOfSpeech}>{capitalizeFirstLetter(word.PartOfSpeech)}</Text>
              <Text style={styles.definitionText}>{capitalizeFirstLetter(word.DefinitionVI)}</Text>
              {formatExamplesWithTranslations(word.Example, word.ExampleVI, index)}
            </View>
          ))}
        </View>
      ) : (
        <Text>Loading...</Text>
      )}

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  partOfSpeech: {
    fontSize: 20,
    color: '#666',
    fontStyle: 'italic',
    fontWeight: 'bold',        
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  phoneticsContainer: {
    marginBottom: 20,
  },
  phoneticText: {
    fontSize: 18,
    color: '#555',
  },
  audioLink: {
    fontSize: 16,
    color: '#0066cc',
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
  exampleText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'left',
    paddingLeft: 10,
  },
  showMoreButton: {
    fontSize: 16,
    color: '#0066cc',
    marginTop: 10,
    textAlign: 'center',
  },
  flag: {
    width: 24,
    height: 16,
    marginRight: 8,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
});

export default WordDetail;