import { View, StyleSheet } from 'react-native'
import React from 'react'
import EditPass from '../components/Setting/EditPass';

const EditPassPage = () => {
  return (
    <View style={styles.container}>
        <EditPass/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default EditPassPage