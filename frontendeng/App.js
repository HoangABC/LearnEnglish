import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, StyleSheet, StatusBar, ImageBackground } from 'react-native';
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
    }, 6000);

    // Clean up the timeout if component unmounts
    return () => clearTimeout(timer);
  }, []);

  if (isSplashVisible) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <ImageBackground source={require('./src/assets/images/EEani.gif')} style={styles.splashImage}>
          {/* Nếu cần, bạn có thể thêm nội dung ở đây */}
        </ImageBackground>
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
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});

export default App;
