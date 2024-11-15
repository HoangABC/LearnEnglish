import { View, StyleSheet } from 'react-native'
import React from 'react'
import Settings from '../components/setting/Settings';




const SettingsPage = () => {
  return (
    <View style={styles.container}>
        <Settings/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default SettingsPage