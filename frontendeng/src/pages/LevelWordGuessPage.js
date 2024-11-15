import { View, StyleSheet } from 'react-native'
import React from 'react'
import LevelWordGuess from '../components/Game/LevelWordGuess';



const LevelWordGuessPage = () => {
  return (
    <View style={styles.container}>
      <LevelWordGuess />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default LevelWordGuessPage