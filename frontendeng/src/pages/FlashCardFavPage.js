import { View, StyleSheet } from 'react-native'
import React from 'react'
import FlashCardFav from '../components/FlashCard/FlashCardFav'


const FlashCardFavPage = () => {
  return (
    <View style={styles.container}>
      <FlashCardFav/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default FlashCardFavPage