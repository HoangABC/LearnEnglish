import { View, StyleSheet } from 'react-native'
import React from 'react'
import FlashCardVoca from '../components/FlashCard/FlashCardVoca'


const FlashCardVocaPage = () => {
  return (
    <View style={styles.container}>
      <FlashCardVoca/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default FlashCardVocaPage