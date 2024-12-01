import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Markdown from 'react-native-markdown-display';

const ChatBubble = ({ role, text }) => (
  <View style={styles.bubbleContainer}>
    <View style={[styles.chatItem, role === "user" ? styles.userChatItem : styles.modelChatItem]}>
      <Markdown style={styles.markdown} selectable>
        {text}
      </Markdown>
    </View>
  </View>
);

const styles = StyleSheet.create({
  bubbleContainer: {
    width: '100%',
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  chatItem: {
    padding: 12,
    borderRadius: 12,
    maxWidth: '100%',
    paddingRight: 16,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  userChatItem: {
    alignSelf: "flex-end",
    backgroundColor: "#FFEFD5",
    minWidth: 50,
    maxWidth: '80%',
    paddingHorizontal: 16,
  },
  modelChatItem: {
    alignSelf: "flex-start",
    backgroundColor: "transparent",
  },
  chatText: {
    fontSize: 16,
    color: "#1F2937",
    flexShrink: 1,
    flex: 1,
  },
  typingIndicator: {
    color: "#1F2937",
    fontSize: 18,
    position: 'absolute',
    bottom: 16,
    right: 16,
    opacity: 0.5,
  },
  markdown: {
    body: {
      fontSize: 16,
      lineHeight: 24,
      color: '#1F2937',
      paddingRight: 4,
    },
    paragraph: {
      fontSize: 16,
      lineHeight: 24,
      marginVertical: 4,
    },
    bullet_list: {
      fontSize: 16,
    },
  },
});

export default ChatBubble;
