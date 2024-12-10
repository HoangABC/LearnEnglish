import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Modal,
  SafeAreaView,
} from 'react-native';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroText,
  ViroConstants,
  ViroARTrackingTargets,
  ViroARImageMarker,
} from '@viro-community/react-viro';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Appbar } from 'react-native-paper';

const ARScene = ({ onWordDetected }) => {
  const [text, setText] = useState('Initializing AR...');

  const onInitialized = (state, reason) => {
    if (state === ViroConstants.TRACKING_NORMAL) {
      setText('');
    } else if (state === ViroConstants.TRACKING_NONE) {
      setText('No tracking available');
    }
  };

  // Định nghĩa các target images để tracking
  useEffect(() => {
    ViroARTrackingTargets.createTargets({
      "table": {
        source: require("../../assets/images/Bot.png"),
        orientation: "Up",
        physicalWidth: 0.1 // real world width in meters
      },
      "chair": {
        source: require("../../assets/images/Bot.png"),
        orientation: "Up",
        physicalWidth: 0.1
      },
      // Thêm các target khác
    });
  }, []);

  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
      {text ? (
        <ViroText
          text={text}
          scale={[0.5, 0.5, 0.5]}
          position={[0, 0, -1]}
          style={styles.helloWorldTextStyle}
        />
      ) : null}

      <ViroARImageMarker target={"table"}
        onAnchorFound={() => {
          onWordDetected({
            word: "Table",
            translation: "Cái bàn",
            position: { x: 0, y: 0.1, z: -1 }
          });
        }}
      >
        <ViroText
          text="Table - Cái bàn"
          scale={[0.1, 0.1, 0.1]}
          position={[0, 0, 0]}
          style={styles.wordTextStyle}
        />
      </ViroARImageMarker>

      {/* Thêm các markers khác tương tự */}
    </ViroARScene>
  );
};

const ARVocabularyView = () => {
  const navigation = useNavigation();
  const [selectedWord, setSelectedWord] = useState(null);
  const [detectedWords, setDetectedWords] = useState([]);

  const handleWordDetected = (wordInfo) => {
    setDetectedWords(prev => [...prev, wordInfo]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="AR Vocabulary" />
        <Appbar.Action 
          icon="information" 
          onPress={() => {/* Show help/info */}} 
        />
      </Appbar.Header>

      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: () => <ARScene onWordDetected={handleWordDetected} />
        }}
        style={styles.arView}
      />

      {/* Overlay for detected words list */}
      <View style={styles.wordsList}>
        {detectedWords.map((word, index) => (
          <TouchableOpacity
            key={index}
            style={styles.wordItem}
            onPress={() => setSelectedWord(word)}
          >
            <Text style={styles.wordText}>{word.word}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Word Detail Modal */}
      <Modal
        visible={selectedWord !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedWord(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedWord(null)}
            >
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>

            {selectedWord && (
              <>
                <Text style={styles.modalWord}>{selectedWord.word}</Text>
                <Text style={styles.modalTranslation}>
                  {selectedWord.translation}
                </Text>
                <TouchableOpacity style={styles.addToFlashcardButton}>
                  <Text style={styles.buttonText}>Add to Flashcards</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#fff',
  },
  arView: {
    flex: 1,
  },
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  wordTextStyle: {
    fontFamily: 'Arial',
    fontSize: 12,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  wordsList: {
    position: 'absolute',
    right: 20,
    top: 100,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 10,
  },
  wordItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff44',
  },
  wordText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  modalWord: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  modalTranslation: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  addToFlashcardButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ARVocabularyView;