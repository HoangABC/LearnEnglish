import React from "react";
import { View, StyleSheet } from "react-native";
import Markdown from 'react-native-markdown-display';

const ChatBubble = ({ role, text }) => {
  return (
    <View
      style={[
        styles.chatItem,
        role === "user" ? styles.userChatItem : styles.modelChatItem,
      ]}
    >
      <Markdown style={styles.chatText}>{text}</Markdown>
    </View>
  );
};

const styles = StyleSheet.create({
   chatItem: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: "70%",
  },
  userChatItem: {
    alignSelf: "flex-end",
    backgroundColor: "#FFEFD5", // Light peach background for user
  },
  modelChatItem: {
    alignSelf: "flex-start",
    backgroundColor: "transparent", // Transparent background for model
  },
  chatText: {
    fontSize: 16,
    color: "#000", // Black text color for both user and model
  },
});

export default ChatBubble;
