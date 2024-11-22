import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import useLogin from '../hooks/useLogin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { setUser } from '../redux/authSlice';
import Feather from 'react-native-vector-icons/Feather';

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
  const [secureText, setSecureText] = useState(true); 

  useEffect(() => {
    const { params } = route;
    if (params?.login === 'success') {
      AsyncStorage.getItem('user').then(user => {
        if (user) {
          const parsedUser = JSON.parse(user);
          if (parsedUser.LevelId === null) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'LevelListView' }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'AppTabs' }],
            });
          }
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
        if (user.LevelId === null) {
          navigation.navigate('LevelListView');
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'AppTabs' }],
          });
        }
        showMessage({ message: "Đăng nhập thành công!", type: "success" });
      } else {
        showMessage({ message: error || "Tài khoản hoặc mật khẩu không chính xác !", type: "danger",
          icon: "danger",
          duration: 5000,
          autoHide: true, 
          animationDuration: 500,  });
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
      await GoogleSignin.signOut();
      const { idToken } = await GoogleSignin.signIn();
      const { success, user } = await googleLogin(idToken);
      if (success) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        dispatch(setUser(user));
        if (user.LevelId === null) {
          navigation.navigate('LevelListView');
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'AppTabs' }],
          });
        }
        showMessage({ message: "Đăng nhập thành công!", type: "success" });
      } else {
        showMessage({ message: "Đăng nhập thất bại", type: "danger" });
      }
    } catch (error) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        console.error('Lỗi đăng nhập Google:', error);
        showMessage({ message: 'Lỗi đăng nhập', description: error.message, type: 'danger' });
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      <View style={styles.loginCard}>
        <View style={styles.loginBox}>
          <Text style={styles.title}>Đăng Nhập</Text>

          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email hoặc Username"
              placeholderTextColor="#999"
              value={emailOrUsername}
              onChangeText={setEmailOrUsername}
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              secureTextEntry={secureText}
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeIconContainer}>
              <Feather name={secureText ? 'eye-off' : 'eye'} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
          ) : (
            <>
              <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                <Text style={styles.buttonText}>Đăng nhập</Text>
              </TouchableOpacity>
              
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>HOẶC</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                <View style={styles.googleButtonContent}>
                  <Image 
                    source={require('../assets/icons/gg-icon.png')} 
                    style={styles.googleIcon} 
                  />
                  <Text style={styles.googleButtonText}>Đăng nhập bằng Google</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Bạn chưa có tài khoản? </Text>
        <TouchableOpacity onPress={navigateToRegister}>
          <Text style={styles.registerLink}>Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
      <FlashMessage position="top" />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  logo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginTop: 60,
    marginBottom: 40,
    resizeMode: 'contain',
  },
  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 45,
    fontSize: 16,
    color: '#333',
  },
  icon: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 1,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
  },
  primaryButton: {
    backgroundColor: '#007bff',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
    width: '60%',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 16,
    color: '#666',
  },
  registerLink: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
});

export default Login;
