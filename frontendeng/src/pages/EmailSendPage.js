import { View, StyleSheet } from 'react-native'
import React from 'react'
import EmailSend from '../components/ForgotPass/EmailSend';

const EmailSendPage = () => {
  return (
    <View style={styles.container}>
      <EmailSend/>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default EmailSendPage