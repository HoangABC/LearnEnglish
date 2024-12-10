import { View, StyleSheet } from 'react-native'
import React from 'react'
import ARVocabularyView from '../components/FlashCard/ARVocabularyView';


const ARVocabularyViewPage = () => {
  return (
    <View style={styles.container}>
      <ARVocabularyView/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default ARVocabularyViewPage