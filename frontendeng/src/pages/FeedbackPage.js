import { View, StyleSheet } from 'react-native'
import React from 'react'
import Feedback from '../components/Feedback/Feedback';



const FeedbackPage = () => {
  return (
    <View style={styles.container}>
      <Feedback/>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default FeedbackPage