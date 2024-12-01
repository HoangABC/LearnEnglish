import { View, StyleSheet } from 'react-native'
import React from 'react'
import EmailOTP from '../components/ForgotPass/EmailOTP';




const EmailOTPPage = () => {
  return (
    <View style={styles.container}>
      <EmailOTP/>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default EmailOTPPage