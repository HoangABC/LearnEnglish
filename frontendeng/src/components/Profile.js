import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout as logoutAction } from '../redux/authSlice';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Icon from 'react-native-vector-icons/MaterialIcons'; 

const Profile = () => {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      // Xóa thông tin người dùng khỏi AsyncStorage
      await AsyncStorage.removeItem('user');
      
      // Đăng xuất khỏi Google
      await GoogleSignin.signOut();
      
      // Thực hiện hành động logout để xóa thông tin người dùng khỏi Redux store
      dispatch(logoutAction());
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.languageText}>EasyEnglish</Text>
        <Icon name="notifications" size={24} color="gray" style={styles.bellIcon} /> 
      </View>
      <Text style={styles.text}>Profile</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    elevation: 2, 
  },
  languageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'blue',
  },
  bellIcon: {
    marginLeft: 16,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Profile;
