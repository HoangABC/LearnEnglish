import { View, StyleSheet } from 'react-native'
import React from 'react'
import VoiceAI from '../components/Voice/VoiceAI';


const VoiceAIPage = () => {
    
  return (
    <View style={styles.container}>
      <VoiceAI/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default VoiceAIPage