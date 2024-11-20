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
      <View style={styles.index}>
        <Text style={styles.title}>Trình độ hiện tại của bạn</Text> 
        <Text style={styles.subtitle}>Thông tin này để ứng dụng gợi ý những nội dung phù hợp với trình độ của bạn</Text>
        
        {updateStatus === 'loading' && <ActivityIndicator size="large" color="#0000ff" />}
        {updateStatus === 'succeeded' && <Text style={styles.successText}>Level updated successfully!</Text>}
        {updateStatus === 'failed' && <Text style={styles.errorText}>Update Error: {updateError}</Text>}
        
        <View style={styles.levelListContainer}>
          <FlatList
            data={levels}
            keyExtractor={(item) => item.Id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleItemPress(item.Id)}  // Cập nhật selectedLevelId khi nhấn vào item
                style={[styles.item, selectedLevelId === item.Id ? styles.selectedItem : null]}
              >
                <RadioButton
                  value={item.Id.toString()}
                  status={selectedLevelId === item.Id ? 'checked' : 'unchecked'}
                  onPress={() => handleItemPress(item.Id)}  // Cập nhật selectedLevelId khi nhấn vào radio button
                />
                <Text style={styles.itemText}>{item.LevelName}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmPress}  // Gọi hàm xác nhận khi nhấn nút
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
    alignItems: 'center', 
    justifyContent: 'flex-start', 
    padding: 16,
  },
  index: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,  
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    top:'10%'
  },
  subtitle: { 
    fontSize: 16, 
    textAlign: 'center', 
    marginBottom: 24,
    top:'10%'
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  successText: {
    fontSize: 18,
    color: 'green',
    textAlign: 'center',
    marginBottom: 16,
  },
  levelListContainer: {
    width: '100%',
    backgroundColor: '#f0f0f0', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    marginBottom: 16,
    top:'20%', 
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 18,
    color: 'black',
    marginLeft: 10,
    width: '100%',
  },
  selectedItem: {
    backgroundColor: '#d0e0f0',
  },
  confirmButton: {
    padding: 16,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    width: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',  // Đẩy nút xuống dưới cùng
    marginBottom: 16,  // Khoảng cách dưới nút
  },
  confirmButtonText: {
    fontSize: 18,
    color: 'white',
    width: '100%',
    textAlign: 'center',
  }
});

export default LevelListView;
