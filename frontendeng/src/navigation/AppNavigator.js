import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginAction } from '../redux/authSlice';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import ProfilePage from '../pages/ProfilePage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CreateWordPage from '../pages/CreateWordPage';
import { ActivityIndicator } from 'react-native';

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
    })}
  >
    <Tab.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
    <Tab.Screen name="Profile" component={ProfilePage} options={{ headerShown: false }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          if (user) {
            dispatch(loginAction(user));
          }
        }
      } catch (error) {
        console.error("Failed to load user from AsyncStorage:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [dispatch]);

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="AppTabs" component={AppTabs} options={{ headerShown: false }} />
            <Stack.Screen 
              name="CreateWord" 
              component={CreateWordPage} 
              options={{ title: 'Đóng góp từ vựng' }} 
            />
          </>
        ) : (
          <Stack.Screen 
            name="Login" 
            component={LoginPage} 
            options={{ title: 'Thông Tin' }} 
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
