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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarLabelStyle: {
        fontSize: 16,
      },
    })}
  >
    <Tab.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
    <Tab.Screen name="Profile" component={ProfilePage} options={{ headerShown: false }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
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

  // Logging the initial route for debugging
  console.log('Initial route:', initialRoute);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
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
          name="CreateWord"
          component={CreateWordPage}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
