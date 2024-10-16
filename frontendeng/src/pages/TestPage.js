import { View, StyleSheet } from 'react-native'
import React from 'react'
import Test from '../components/MyTest/Test'


const TestPage = () => {
  return (
    <View style={styles.container}>
      <Test/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default TestPage