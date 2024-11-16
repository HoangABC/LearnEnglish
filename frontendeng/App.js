import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import FastImage from 'react-native-fast-image'; // Import FastImage để hiển thị GIF
import AppNavigator from './src/navigation/AppNavigator'; // Cập nhật đường dẫn theo cấu trúc của bạn
import { Provider } from 'react-redux';
import store from './src/redux/store';
import FlashMessage from 'react-native-flash-message';

const App = () => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    // Hiển thị màn hình splash trong 6 giây trước khi chuyển qua AppNavigator
    const timer = setTimeout(() => {
      setIsSplashVisible(false); // Ẩn splash screen sau 6 giây
    }, 5000);

    // Clean up the timeout if component unmounts
    return () => clearTimeout(timer);
  }, []);

  if (isSplashVisible) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <FastImage
          source={require('./src/assets/images/EEani.gif')}
          style={styles.splashImage}
          resizeMode={FastImage.resizeMode.contain} // Đảm bảo ảnh hiển thị đúng
        />
      </SafeAreaView>
    );
  }

  return (
    <Provider store={store}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AppNavigator />
      <FlashMessage position="top" />
    </Provider>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
});

export default App;
