import React from 'react';
import { Provider } from 'react-redux';
import { View, StyleSheet, StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator'; // Cập nhật đường dẫn theo cấu trúc của bạn
import store from './src/redux/store';
import FlashMessage from 'react-native-flash-message';

const App = () => {
  return (
    <Provider store={store}>
      <View style={styles.container}>
        <StatusBar 
          barStyle="dark-content" // Chọn màu của nội dung thanh trạng thái
          backgroundColor="#ffffff" // Màu nền của thanh trạng thái
        />
        <AppNavigator />
        <FlashMessage position="top" />
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
