import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const Settings = () => {
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null); // 'US' or 'UK' or null
  const navigation = useNavigation();


  useEffect(() => {
    // Load settings from AsyncStorage when the component mounts
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('autoPlaySound');
        if (savedSettings) {
          const { isEnabled, region } = JSON.parse(savedSettings);
          setIsAutoPlayEnabled(isEnabled);
          setSelectedRegion(region);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const saveAutoPlaySetting = async (isEnabled, region) => {
    try {
      await AsyncStorage.setItem('autoPlaySound', JSON.stringify({ isEnabled, region }));
    } catch (error) {
      console.error('Failed to save autoPlaySound settings:', error);
    }
  };

  const toggleAutoPlay = () => {
    const newAutoPlayStatus = !isAutoPlayEnabled;
    setIsAutoPlayEnabled(newAutoPlayStatus);
    saveAutoPlaySetting(newAutoPlayStatus, selectedRegion);
  };

  const selectRegion = (region) => {
    setSelectedRegion(region);
    saveAutoPlaySetting(isAutoPlayEnabled, region);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Auto Play Sound</Text>
        <Switch
          value={isAutoPlayEnabled}
          onValueChange={toggleAutoPlay}
        />
      </View>

      {isAutoPlayEnabled && (
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Sound Preference</Text>
          <View style={styles.soundOptions}>
            <TouchableOpacity
              style={[
                styles.soundOption,
                selectedRegion === 'UK' && styles.selectedSoundOption,
              ]}
              onPress={() => selectRegion('UK')}
            >
              <Icon name="volume-up" size={24} color={selectedRegion === 'UK' ? 'white' : 'black'} />
              <Text style={[selectedRegion === 'UK' ? styles.selectedSoundText : styles.soundText,{ fontSize: 16, letterSpacing: 0, paddingHorizontal: 5 },]}>UK</Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.soundOption,
                selectedRegion === 'US' && styles.selectedSoundOption,
              ]}
              onPress={() => selectRegion('US')}
            >
              <Icon name="volume-up" size={24} color={selectedRegion === 'US' ? 'white' : 'black'} />
              <Text style={selectedRegion === 'US' ? styles.selectedSoundText : styles.soundText}>US</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 18,
    color: '#333',
  },
  soundOptions: {
    flexDirection: 'row',
    
  },
  soundOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  selectedSoundOption: {
    backgroundColor: '#007AFF',
  },
  soundText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#333',
  },
  selectedSoundText: {
    color: 'white',
  },
  saveButton: {
    marginTop: 50,
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default Settings;
