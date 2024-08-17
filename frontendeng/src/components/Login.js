import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import useLogin from '../hooks/useLogin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { setUser } from '../redux/authSlice';

GoogleSignin.configure({
  forceConsentPrompt: true,
  offlineAccess: false,
  webClientId: '342637437251-io70dqt8qaoq9n2jk5mtj88pvqli2160.apps.googleusercontent.com',
});

const Login = () => {
  const dispatch = useDispatch();
  const { emailOrUsername, setEmailOrUsername, password, setPassword, login, googleLogin, error } = useLogin();
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
            routes: [{ name: 'AppTabs' }],
          });
          showMessage({ message: "Đăng nhập thành công!", type: "success" });
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
          routes: [{ name: 'AppTabs' }],
        });
        showMessage({ message: "Đăng nhập thành công!", type: "success" });
      } else {
        showMessage({ message: error || "Có lỗi xảy ra", type: "danger" });
      }
    } catch (e) {
      showMessage({ message: 'Lỗi đăng nhập', description: e.message, type: 'danger' });
    } finally {
      setLoading(false);
    }
  };
  

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      
      // Đăng xuất người dùng nếu đã đăng nhập
      await GoogleSignin.signOut();
  
      const { idToken } = await GoogleSignin.signIn();
      const { success, user } = await googleLogin(idToken);
  
      if (success) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        dispatch(setUser(user));
        navigation.reset({
          index: 0,
          routes: [{ name: 'AppTabs' }],
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
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        console.error('Lỗi đăng nhập Google:', error);
        showMessage({
          message: 'Lỗi đăng nhập',
          description: error.message,
          type: 'danger',
        });
      }
    } finally {
      setLoading(false);
    }
  };
  

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Adjust the offset as needed
    >
      <Image
        source={require('../assets/images/logo.png')} 
        style={styles.logo}
      />
      <View style={styles.loginCard}>
        <View style={styles.loginBox}>
          <Text style={styles.title}>Đăng Nhập</Text>
          <TextInput
            style={styles.input}
            placeholder="Email hoặc Username"
            placeholderTextColor="#666"
            value={emailOrUsername}
            onChangeText={setEmailOrUsername}
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
      </View>
      <View>
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
      <View style={styles.registerContainer}>
      <View style={styles.registerRow}>
        <Text style={styles.registerText}>
          Bạn chưa có tài khoản?{' '}
        </Text>
        <TouchableOpacity onPress={navigateToRegister}>
          <Text style={styles.registerLink}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
      <FlashMessage position="top" />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logo: {
    width: 250,  // Tăng kích thước logo
    height: 250, // Tăng kích thước logo
    marginBottom: 5,
    resizeMode: 'contain',
  },
  loginCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
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
  registerContainer: {
    marginTop: 20,
    alignItems: 'center', 
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center', 
  },
  registerText: {
    fontSize: 16,
  },
  registerLink: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Login;