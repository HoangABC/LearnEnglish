import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import useUserLevel from '../hooks/useUserLevel';
import { useNavigation, useRoute } from '@react-navigation/native';

const LevelListView = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { Id } = route.params || {};  // Lấy Id từ tham số của route
  const { levels, status, error, setUserLevel, updateStatus, updateError } = useUserLevel();
  const [selectedLevelId, setSelectedLevelId] = useState(null);

  useEffect(() => {
    if (updateStatus === 'succeeded') {
      navigation.navigate('AppTabs');  // Điều hướng đến tab 'Home' trong 'AppTabs'
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

  const handleItemPress = async (levelId) => {
    if (!Id || !levelId) {
      console.error('Id or LevelId is missing');
      return;
    }

    try {
      setSelectedLevelId(levelId);
      await setUserLevel(Id, levelId);
      // Optional: additional logic on success
    } catch (error) {
      console.error('Error updating level:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách Cấp độ</Text>
      {updateStatus === 'loading' && <ActivityIndicator size="large" color="#0000ff" />}
      {updateStatus === 'succeeded' && <Text style={styles.successText}>Level updated successfully!</Text>}
      {updateStatus === 'failed' && <Text style={styles.errorText}>Update Error: {updateError}</Text>}
      <FlatList
        data={levels}
        keyExtractor={(item) => item.Id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleItemPress(item.Id)}
            style={[
              styles.item,
              selectedLevelId === item.Id ? styles.selectedItem : null,
            ]}
          >
            <Text style={styles.itemText}>{item.LevelName}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#d0e0f0',
  },
  itemText: {
    fontSize: 18,
    color: 'black',
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
});

export default LevelListView;
