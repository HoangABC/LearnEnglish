import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import FastImage from 'react-native-fast-image'; 
import AppNavigator from './src/navigation/AppNavigator'; 
import { Provider } from 'react-redux';
import store from './src/redux/store';
import FlashMessage from 'react-native-flash-message';
import { NavigationRef } from './src/navigation/NavigationRef';

const App = () => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (isSplashVisible) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <FastImage
          source={require('./src/assets/images/EEani.gif')}
          style={styles.splashImage}
          resizeMode={FastImage.resizeMode.contain}
        />
      </SafeAreaView>
    );
  }

  return (
    <Provider store={store}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AppNavigator navigationRef={NavigationRef} />
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
