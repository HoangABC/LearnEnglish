import React, { useState, useEffect } from 'react';  
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import useUserLevel from '../hooks/useUserLevel';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RadioButton } from 'react-native-paper';

const LevelListView = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { Id } = route.params || {};
  const { levels, status, error, setUserLevel, updateStatus, updateError } = useUserLevel();
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [confirmedLevelId, setConfirmedLevelId] = useState(null);

  useEffect(() => {
    if (updateStatus === 'succeeded') {
      navigation.navigate('AppTabs');  
    }
  }, [updateStatus, navigation]);

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (status === 'failed') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const handleItemPress = (levelId) => {
    setSelectedLevelId(levelId); // Cập nhật selectedLevelId khi nhấn vào item
  };

  const handleConfirmPress = async () => {
    if (!Id || !selectedLevelId) {  // Kiểm tra nếu Id hoặc selectedLevelId bị thiếu
      console.error('Id or LevelId is missing');
      return;
    }

    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        console.error('User not found in AsyncStorage');
        return;
      }

      const user = JSON.parse(userData);
      user.LevelId = selectedLevelId;  // Cập nhật LevelId cho người dùng
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await setUserLevel(Id, selectedLevelId);  // Cập nhật trình độ cho người dùng
    } catch (error) {
      console.error('Error updating level:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Trình độ hiện tại của bạn</Text>
        <Text style={styles.subtitle}>
          Thông tin này để ứng dụng gợi ý những nội dung phù hợp với trình độ của bạn
        </Text>

        {updateStatus === 'loading' && <ActivityIndicator size="large" color="#007BFF" />}
        {updateStatus === 'succeeded' && (
          <Text style={styles.successText}>Level updated successfully!</Text>
        )}
        {updateStatus === 'failed' && (
          <Text style={styles.errorText}>Update Error: {updateError}</Text>
        )}

        <View style={styles.levelListContainer}>
          <FlatList
            data={levels}
            keyExtractor={(item) => item.Id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleItemPress(item.Id)}
                style={[
                  styles.item,
                  selectedLevelId === item.Id && styles.selectedItem
                ]}
              >
                <View style={styles.radioContainer}>
                  <RadioButton
                    value={item.Id.toString()}
                    status={selectedLevelId === item.Id ? 'checked' : 'unchecked'}
                    onPress={() => handleItemPress(item.Id)}
                    color="#007BFF"
                  />
                  <Text style={[
                    styles.itemText,
                    selectedLevelId === item.Id && styles.selectedItemText
                  ]}>
                    {item.LevelName}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            !selectedLevelId && styles.confirmButtonDisabled
          ]}
          onPress={handleConfirmPress}
          disabled={!selectedLevelId}
        >
          <Text style={styles.confirmButtonText}>Xác nhận</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 40,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  levelListContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
    marginBottom: 30,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  selectedItem: {
    backgroundColor: '#f0f7ff',
  },
  selectedItemText: {
    color: '#007BFF',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginTop: 'auto',
    marginBottom: 20,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  successText: {
    color: '#28a745',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default LevelListView;
