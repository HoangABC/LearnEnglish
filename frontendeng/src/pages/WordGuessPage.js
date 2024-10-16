import { View, StyleSheet } from 'react-native'
import React from 'react'
import WordGuess from '../components/Game/WordGuess';



const WordGuessPage = () => {
  return (
    <View style={styles.container}>
      <WordGuess/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default WordGuessPage