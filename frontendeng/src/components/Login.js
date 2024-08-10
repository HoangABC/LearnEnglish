import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import useLogin from '../hooks/useLogin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';


GoogleSignin.configure({
  offlineAccess: true,
  webClientId: '342637437251-nb4i03dmvpl0cvnqqco8bsdprj4to0r0.apps.googleusercontent.com', 
});


const Login = () => {
  const { email, setEmail, password, setPassword, login, error } = useLogin();
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { params } = route;
    if (params?.login === 'success') {
      AsyncStorage.getItem('user').then(user => {
        if (user) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
          showMessage({
            message: "Đăng nhập thành công!",
            type: "success",
          });
        }
      });
    }
  }, [route.params, navigation]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { success, user } = await login();
      if (success) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        showMessage({
          message: "Đăng nhập thành công!",
          type: "success",
        });
      } else {
        showMessage({
          message: error || "Có lỗi xảy ra",
          type: "danger",
        });
      }
    } catch (e) {
      showMessage({
        message: 'Lỗi đăng nhập',
        description: e.message,
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
  
      // Gửi thông tin người dùng đến backend để xử lý đăng nhập
      const response = await fetch('http://26.169.114.72:3000/auth/google/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: userInfo.idToken }),
      });
      
      const result = await response.json();
      if (response.ok) {
        Alert.alert('Đăng nhập thành công', `Xin chào ${result.name}`);
      } else {
        Alert.alert('Đăng nhập thất bại', result.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // Người dùng hủy đăng nhập
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Đăng nhập đang được thực hiện
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // Google Play Services không khả dụng
      } else {
        // Xử lý các lỗi khác
        Alert.alert('Lỗi', error.message);
      }
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Nhập</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
            <Text style={styles.buttonText}>Đăng nhập bằng Google</Text>
          </TouchableOpacity>
        </>
      )}
      <FlashMessage position="top" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Login;
