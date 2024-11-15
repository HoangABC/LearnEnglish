import { View, StyleSheet } from 'react-native'
import React from 'react'
import Listen from '../components/Listen/Listen';



const ListenPage = () => {
  return (
    <View style={styles.container}>
      <Listen/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default ListenPage