import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useChangePassword } from '../../hooks/useChangePassword'; 
import { showMessage } from 'react-native-flash-message';
import { useNavigation } from '@react-navigation/native'; 

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
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="key" size={24} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu hiện tại"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mật khẩu mới</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="key-variant" size={24} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu mới"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nhập lại mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Entypo name="key" size={24} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  menuContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditPass;
