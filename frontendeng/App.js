import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator'; // Cập nhật đường dẫn theo cấu trúc của bạn
import { Provider } from 'react-redux';
import store from './src/redux/store';
import FlashMessage from 'react-native-flash-message';

const App = () => {
  return (
    <Provider store={store}>
        <StatusBar 
          barStyle="dark-content" // Chọn màu của nội dung thanh trạng thái
          backgroundColor="#ffffff" // Màu nền của thanh trạng thái
        />
        <AppNavigator />
        <FlashMessage position="top" />
    </Provider>
  );
};

export default App;