import { View, StyleSheet } from 'react-native'
import React from 'react'
import EditInfo from '../components/Setting/EditInfo';

const EditInfoPage = () => {
  return (
    <View style={styles.container}>
        <EditInfo/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default EditInfoPage