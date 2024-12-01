import { View, StyleSheet } from 'react-native'
import React from 'react'
import ForgotPass from '../components/ForgotPass/ForgotPass';



const ForgotPassPage = () => {
  return (
    <View style={styles.container}>
      <ForgotPass/>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default ForgotPassPage