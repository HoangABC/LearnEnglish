import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout as logoutAction } from '../redux/authSlice';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

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
    padding: 16,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default Profile;
