import { View, StyleSheet } from 'react-native'
import React from 'react'
import ChatBot from '../components/AI/ChatBot';

const ChatBotPage = () => {
  return (
    <View style={styles.container}>
      <ChatBot/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default ChatBotPage