import React, { useEffect, useState } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser, logout } from '../redux/authSlice';
import LoginPage from '../pages/LoginPage';
import ProfilePage from '../pages/ProfilePage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CreateWordPage from '../pages/CreateWordPage';
import { ActivityIndicator, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RegisterPage from '../pages/RegisterPage';
import LevelListViewPage from '../pages/LevelListViewPage';
import HomePage from '../pages/HomePage';
import FlashCardVocaPage from '../pages/FlashCardVocaPage';
import FlashCardFavPage from '../pages/FlashCardFavPage';
import TestPage from '../pages/TestPage';
import SuccessScreenPage from '../pages/SuccessScreenPage';
import WordGuessPage from '../pages/WordGuessPage';
import ChatBotPage from '../pages/ChatBotPage';
import LevelWordGuessPage from '../pages/LevelWordGuessPage';
import WordDetailPage from '../pages/WordDetailPage';
import ListenPage from '../pages/ListenPage';
import SettingsPage from '../pages/SettingsPage';
import EditInfoPage from '../pages/EditInfoPage';
import EditPassPage from '../pages/EditPassPage';
import FeedbackPage from '../pages/FeedbackPage';
import ForgotPassPage from '../pages/ForgotPassPage';
import EmailSendPage from '../pages/EmailSendPage';
import EmailOTPPage from '../pages/EmailOTPPage';
import VoiceAIPage from '../pages/VoiceAIPage';
import ARVocabularyViewPage from '../pages/ARVocabularyViewPage';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size, focused }) => {
        let iconName;
        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        }
        return (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            top: 5
          }}>
            <Icon name={iconName} size={24} color={focused ? '#2196F3' : color} />
            {focused && (
              <View
                style={{
                  width: 20,
                  height: 2,
                  backgroundColor: '#2196F3',
                  marginTop: 4
                }}
              />
            )}
          </View>
        );
      },
      tabBarStyle: {
        height: 65,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        borderTopWidth: 0,
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      tabBarLabelStyle: {
        fontSize: 13,
        fontWeight: '600',
        paddingBottom: 8,
      },
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: '#9E9E9E',
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomePage} 
      options={{ 
        headerShown: false,
        tabBarLabel: 'Trang chủ'
      }} 
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfilePage} 
      options={{ 
        headerShown: false,
        tabBarLabel: 'Hồ sơ'
      }} 
    />
  </Tab.Navigator>
);

const AppNavigator = ({ navigationRef }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('Loading user from AsyncStorage...');
        const userJson = await AsyncStorage.getItem('user');
        console.log('User JSON:', userJson);
        if (userJson) {
          const user = JSON.parse(userJson);
          console.log('Parsed User:', user);
          console.log('User LevelId:', user?.LevelId);
          if (user.LevelId === null) {
            console.log('User has LevelId null, setting route to LevelListView');
            setInitialRoute('LevelListView');
          } else {
            console.log('User has LevelId, setting route to AppTabs');
            setInitialRoute('AppTabs');
          }
          dispatch(setUser(user));
        } else {
          console.log('No user found, setting route to Login');
          dispatch(logout());
          setInitialRoute('Login');
        }
      } catch (error) {
        console.error("Failed to load user from AsyncStorage:", error);
        dispatch(logout());
        setInitialRoute('Login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [dispatch]);

  // Cập nhật AsyncStorage khi thông tin người dùng trong Redux store thay đổi
  const updateUserInStorage = async () => {
    if (user) {
      try {
        console.log('Updating user in AsyncStorage...');
        console.log('User to be updated:', user); // Log user to check current state
        await AsyncStorage.setItem('user', JSON.stringify(user));
        console.log('User updated successfully in AsyncStorage'); // Log khi cập nhật thành công
      } catch (error) {
        console.error('Failed to update user in AsyncStorage:', error);
      }
    }
  };

  useEffect(() => {
    updateUserInStorage();
  }, [user]);

  // Theo dõi sự thay đổi của LevelId
  useEffect(() => {
    if (user && user.LevelId) {
      console.log(`User LevelId đã thay đổi: ${user.LevelId}`);
      // Gọi hàm cập nhật AsyncStorage nếu cần
      updateUserInStorage();
    }
  }, [user?.LevelId]); // Theo dõi LevelId

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="LevelListView"
          component={LevelListViewPage}
          initialParams={{ Id: user?.Id }}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AppTabs"
          component={AppTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FlashCardVoca"
          component={FlashCardVocaPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FlashCardFav"
          component={FlashCardFavPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateWord"
          component={CreateWordPage}
        />
        <Stack.Screen
          name="Test"
          component={TestPage}
          options={{ headerTitle: '' }}
        />
         <Stack.Screen
          name="Listen"
          component={ListenPage}
          options={{ headerTitle: '' }}
        />
        <Stack.Screen
          name="SuccessScreen"
          component={SuccessScreenPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WordGuess"
          component={WordGuessPage}
          options={{ headerShown: false }}
        />
          <Stack.Screen
          name="LevelWordGuess"
          component={LevelWordGuessPage}
          options={{ headerTitle: '' }}
        />
        <Stack.Screen
          name="ChatBot"
          component={ChatBotPage}
          options={{ headerTitle: '' }}
        />
        <Stack.Screen
          name="VoiceAI"
          component={VoiceAIPage}
          options={{ headerTitle: '' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsPage}
          options={{ headerTitle: '' }}
        />
         <Stack.Screen
          name="WordDetail"
          component={WordDetailPage}
          options={{ headerTitle: '' }}
        />
        <Stack.Screen
          name="EditInfo"
          component={EditInfoPage}
          options={{ headerTitle: '' }}
        />
        <Stack.Screen
          name="EditPass"
          component={EditPassPage}
          options={{ headerTitle: '' }}
        />
        <Stack.Screen
          name="Feedback"
          component={FeedbackPage}
          options={{ headerTitle: '' }}
        />
        <Stack.Screen
          name="Login"
          component={LoginPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterPage}
          options={{ headerTitle: '' }}
        />
        <Stack.Screen
          name="ForgotPass"
          component={ForgotPassPage}
          options={{ headerTitle: '' }}
        />
        <Stack.Screen
          name="EmailSend"
          component={EmailSendPage}
          options={{ headerTitle: '' }}
        />
        <Stack.Screen 
          name="ARVocabularyView" 
          component={ARVocabularyViewPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EmailOTP"
          component={EmailOTPPage}
          options={{ headerTitle: '' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
