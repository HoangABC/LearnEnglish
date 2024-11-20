import { View, StyleSheet } from 'react-native'
import React from 'react'
import LevelListView from '../components/LevelListView'

const LevelListViewPage = () => {
  return (
    <View style={styles.container}>
      <LevelListView/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default LevelListViewPage