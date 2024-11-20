import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useChangePassword } from '../../hooks/useChangePassword'; // Đảm bảo import hook đúng
import { showMessage } from 'react-native-flash-message'; // Import thêm nếu chưa có
import { useNavigation } from '@react-navigation/native'; // Import hook navigation

const EditPass = () => {
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { handleChangePassword, status, error } = useChangePassword();  
  const navigation = useNavigation(); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          setUserDetails(parsedUser);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      showMessage({
        message: "Mật khẩu mới và mật khẩu nhập lại không khớp!",
        type: 'danger',
        icon: 'danger',
      });
      return;
    }

    if (newPassword.length < 6) {
      showMessage({
        message: "Mật khẩu mới phải có ít nhất 6 ký tự!",
        type: 'danger',
        icon: 'danger',
      });
      return;
    }

    const isPasswordChanged = await handleChangePassword(currentPassword, newPassword);

    if (isPasswordChanged) {
      showMessage({
        message: "Mật khẩu đã được thay đổi thành công.",
        type: 'success',
        icon: 'success',
      });
   
      navigation.goBack(); 
    } else {
      showMessage({
        message: "Đã xảy ra lỗi khi thay đổi mật khẩu.",
        type: 'danger',
        icon: 'danger',
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.menuContainer}>
        <Text style={styles.contactHeader}>Mật khẩu hiện tại</Text>
        <View style={styles.ItemEdit}>
          <View style={[styles.menuItem, { flex: 10 }]}>
            <MaterialCommunityIcons name="key" size={29} />
            <TextInput
              style={styles.menuItemText}
              placeholder="Nhập mật khẩu hiện tại"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
          </View>
        </View>

        <Text style={styles.contactHeader}>Mật khẩu mới</Text>
        <View style={styles.ItemEdit}>
          <View style={[styles.menuItem, { flex: 10 }]}>
            <MaterialCommunityIcons name="key-variant" size={29} />
            <TextInput
              style={styles.menuItemText}
              placeholder="Nhập mật khẩu mới"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>
        </View>

        <Text style={styles.contactHeader}>Nhập lại mật khẩu</Text>
        <View style={styles.ItemEdit}>
          <View style={[styles.menuItem, { flex: 10 }]}>
            <Entypo name="key" size={29} />
            <TextInput
              style={styles.menuItemText}
              placeholder="Nhập lại mật khẩu"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        </View>
        
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Lưu thông tin</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuContainer: {
    flex: 1,
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'black',
  },
  menuItemText: {
    fontSize: 18,
    marginLeft: 10,
    flex: 1,
    color: 'black',
  },
  contactHeader: {
    fontSize: 18,
    fontWeight: '900',
    marginVertical: 10,
    backgroundColor: '#DDDDDD',
    padding: 10,
    color: 'black',
  },
  saveButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditPass;
