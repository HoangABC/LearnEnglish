import { View, StyleSheet } from 'react-native'
import React from 'react'
import SuccessScreen from '../components/MyTest/SuccessScreen';



const SuccessScreenPage = () => {
  return (
    <View style={styles.container}>
      <SuccessScreen/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default SuccessScreenPage