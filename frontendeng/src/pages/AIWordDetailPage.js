import { View, StyleSheet } from 'react-native'
import React from 'react'
import AIWordDetail from '../components/FlashCard/AIWordDetail';



const AIWordDetailPage = () => {
  return (
    <View style={styles.container}>
      <AIWordDetail/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default AIWordDetailPage 