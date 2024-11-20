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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      <View style={styles.loginCard}>
        <View style={styles.loginBox}>
          <Text style={styles.title}>Đăng Nhập</Text>

          {/* TextInput with Icon */}
          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color="#000" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email hoặc Username"
              placeholderTextColor="#666"
              value={emailOrUsername}
              onChangeText={setEmailOrUsername}
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#000" style={styles.icon} />
            
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              secureTextEntry={secureText}
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
            />
            
            <Feather
              name={secureText ? 'eye-off' : 'eye'} 
              size={20}
              color="#000"
              style={styles.eyeIcon}
              onPress={() => setSecureText(!secureText)} 
            />
          </View>

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
          <Text style={styles.registerText}>Bạn chưa có tài khoản?{' '}</Text>
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
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logo: {
    width: 250,
    height: 250,
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
 inputContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 15,
  },
  input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 40,
    paddingRight: 40,
    backgroundColor: '#fff',
  },
  icon: {
    position: 'absolute',
    left: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
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
