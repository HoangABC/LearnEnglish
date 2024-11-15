import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import WordDetail from '../components/WordDetail/WordDetail';

const WordDetailPage = () => {
  return (
    <View style={styles.container}>
      <WordDetail />
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default WordDetailPage