import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux'; // Import useDispatch từ react-redux
import useLogin from '../hooks/useLogin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { setUser } from '../redux/authSlice'; // Import hành động setUser từ redux slice

GoogleSignin.configure({
  forceConsentPrompt: true,
  offlineAccess: false,
  webClientId: '342637437251-io70dqt8qaoq9n2jk5mtj88pvqli2160.apps.googleusercontent.com',
});

const Login = () => {
  const dispatch = useDispatch(); // Khởi tạo dispatch
  const { email, setEmail, password, setPassword, login, googleLogin, error } = useLogin();
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { params } = route;
    if (params?.login === 'success') {
      AsyncStorage.getItem('user').then(user => {
        console.log("User retrieved after login success:", user);
        if (user) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'AppTabs' }],  // Ensure this route name matches with Stack Navigator
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
      console.log("Login response:", { success, user });
      if (success) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        navigation.reset({
          index: 0,
          routes: [{ name: 'AppTabs' }],  // Ensure this route name matches with Stack Navigator
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
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
  
      const { success, user } = await googleLogin(idToken);
      console.log("Google login response:", { success, user });
  
      if (success) {
        // Lưu thông tin người dùng vào AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(user));
        // Cập nhật Redux store
        dispatch(setUser(user)); // Sử dụng dispatch để gọi setUser
        navigation.reset({
          index: 0,
          routes: [{ name: 'AppTabs' }],  // Đảm bảo tên route này khớp với Stack Navigator
        });
        showMessage({
          message: "Đăng nhập thành công!",
          type: "success",
        });
      } else {
        showMessage({
          message: "Đăng nhập thất bại",
          type: "danger",
        });
      }
    } catch (error) {
      console.error('Lỗi đăng nhập Google:', error);
      showMessage({
        message: 'Lỗi đăng nhập',
        description: error.message,
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.loginCard}>
        <View style={styles.loginBox}>
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
        </View>
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
      </View>
    <FlashMessage position="top" />
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loginCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400, // Đặt giới hạn chiều rộng tối đa
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginTop:'48%'
  },
  loginBox: {
    marginBottom: 20,
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