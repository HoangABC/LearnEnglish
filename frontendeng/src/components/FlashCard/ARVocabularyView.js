import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  Image,
  Pressable,
  NativeModules
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';

const { MLKitModule } = NativeModules;

const ARVocabularyView = () => {
  const navigation = useNavigation();
  const devices = useCameraDevices();
  const [device, setDevice] = useState(null);
  const [format, setFormat] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [detectedObject, setDetectedObject] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [detectedLabels, setDetectedLabels] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      if (status === 'granted') {
        setHasPermission(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (devices && devices.length > 0) {
      const backDevice = devices.find((d) => d.position === 'back');
      setDevice(backDevice);

      if (backDevice && backDevice.formats.length > 0) {
        const suitableFormat = backDevice.formats.find(f => 
          f.maxFps >= 30 && f.minFps <= 30
        );
        setFormat(suitableFormat || backDevice.formats[0]);
      }
    }
  }, [devices]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (detectedLabels.length > 0) {
        setShowResults(true);
      }
    });

    return unsubscribe;
  }, [navigation, detectedLabels]);

  const takePhotoAndDetect = async () => {
    if (isProcessing) return;
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off',
      });

      setCapturedImage(photo.path);
      
      const results = await MLKitModule.detectObjects(photo.path);

      if (results && results.length > 0) {
        setDetectedLabels(results);
        setShowResults(true);
      } else {
        setDetectedLabels([{ text: 'No objects detected', confidence: 0 }]);
        setShowResults(true);
      }

    } catch (error) {
      console.error('Process error:', error);
      setDetectedLabels([{ text: 'Error occurred', confidence: 0 }]);
      setShowResults(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectImage = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo' });
      if (result.didCancel) {
        return;
      }
      if (result.errorCode) {
        return;
      }
      if (result.assets && result.assets.length > 0) {
        const photoPath = result.assets[0].uri.replace('file://', '');
        setCapturedImage(photoPath);
        const results = await MLKitModule.detectObjects(photoPath);

        if (results && results.length > 0) {
          setDetectedLabels(results);
          setShowResults(true);
        } else {
          setDetectedLabels([{ text: 'No objects detected', confidence: 0 }]);
          setShowResults(true);
        }
      }
    } catch (error) {
      console.error('Error selecting image: ', error);
    }
  };

  const ResultsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showResults}
      onRequestClose={() => setShowResults(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {capturedImage && (
            <Image 
              source={{ uri: `file://${capturedImage}` }}
              style={styles.capturedImage}
            />
          )}
          <ScrollView style={styles.resultsList}>
            {detectedLabels.map((label, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.resultItem}
                onPress={() => {
                  navigation.push('AIWordDetail', { word: label.text.toLowerCase() });
                }}
              >
                <Text style={styles.labelText}>{label.text}</Text>
                
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowResults(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (!hasPermission) return <Text>No access to camera</Text>;
  if (!device || !format) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        format={format}
        isActive={true}
        photo={true}
      />

      <View style={styles.cameraOverlay}>
        <TouchableOpacity 
          style={styles.captureButton}
          onPress={takePhotoAndDetect}
          disabled={isProcessing}
        >
          <Text style={{ fontSize: 24, color: '#007AFF' }}>📸</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.uploadButton}
        onPress={selectImage}
      >
        <Text style={{ fontSize: 24, color: 'white' }}>📁</Text>
      </TouchableOpacity>

      <ResultsModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    borderWidth: 5,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    marginBottom: 20,
  },
  uploadButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#28a745',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    position: 'absolute',
    bottom: 30,
    left: 30,
  },
  buttonIcon: {
    width: 40,
    height: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  capturedImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  labelText: {
    fontSize: 18,
    fontWeight: '500',
    width: '60%',
  },
  closeButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ARVocabularyView;