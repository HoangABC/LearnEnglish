import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const Settings = () => {
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const navigation = useNavigation();


  useEffect(() => {
 
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

      <View style={styles.card}>
        <View style={styles.settingItem}>
          <View style={styles.labelContainer}>
            <Icon name="volume-up" size={24} color="#333" />
            <Text style={styles.settingLabel}>Auto Play Sound</Text>
          </View>
          <Switch
            value={isAutoPlayEnabled}
            onValueChange={toggleAutoPlay}
            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
            thumbColor={isAutoPlayEnabled ? '#fff' : '#fff'}
          />
        </View>

        {isAutoPlayEnabled && (
          <View style={styles.settingItem}>
            <View style={styles.labelContainer}>
              <Icon name="language" size={24} color="#333" />
              <Text style={styles.settingLabel}>Sound Preference</Text>
            </View>
            <View style={styles.soundOptions}>
              <TouchableOpacity
                style={[
                  styles.soundOption,
                  selectedRegion === 'UK' && styles.selectedSoundOption,
                ]}
                onPress={() => selectRegion('UK')}
              >
                <Icon name="volume-up" size={20} color={selectedRegion === 'UK' ? '#FFFFFF' : '#1C1C1E'} />
                <View style={styles.textContainer}>
                  <Text style={[
                    styles.soundText,
                    selectedRegion === 'UK' && styles.selectedSoundText
                  ]}>U</Text>
                  <Text style={[
                    styles.soundText,
                    selectedRegion === 'UK' && styles.selectedSoundText
                  ]}>K</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.soundOption,
                  selectedRegion === 'US' && styles.selectedSoundOption,
                ]}
                onPress={() => selectRegion('US')}
              >
                <Icon name="volume-up" size={20} color={selectedRegion === 'US' ? '#FFFFFF' : '#1C1C1E'} />
                <Text style={[
                  styles.soundText,
                  selectedRegion === 'US' && styles.selectedSoundText
                ]}>{'US'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#1C1C1E',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 17,
    color: '#1C1C1E',
    marginLeft: 12,
    fontWeight: '500',
  },
  soundOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  soundOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    minWidth: 80,
  },
  selectedSoundOption: {
    backgroundColor: '#007AFF',
  },
  soundText: {
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  selectedSoundText: {
    color: '#FFFFFF',
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  textContainer: {
    flexDirection: 'row',
    gap: 2,
  },
});

export default Settings;
