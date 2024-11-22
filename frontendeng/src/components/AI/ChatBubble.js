import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Markdown from 'react-native-markdown-display';

const ChatBubble = ({ role, text }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (role === 'model') {
      setIsTyping(true);
      setDisplayedText('');
      let index = 0;
      
      const intervalId = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(prev => prev + text.charAt(index));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(intervalId);
        }
      }, 30); // Tốc độ typing, có thể điều chỉnh số 30 để thay đổi tốc độ

      return () => clearInterval(intervalId);
    } else {
      setDisplayedText(text);
    }
  }, [text, role]);

  return (
    <View
      style={[
        styles.chatItem,
        role === "user" ? styles.userChatItem : styles.modelChatItem,
      ]}
    >
      {role === "user" ? (
        <Text style={styles.chatText}>{text}</Text>
      ) : (
        <>
          <Markdown style={styles.chatText}>{displayedText}</Markdown>
          {isTyping && <Text style={styles.typingIndicator}>▋</Text>}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chatItem: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    maxWidth: "80%",
  },
  userChatItem: {
    alignSelf: "flex-end",
    backgroundColor: "#FFEFD5",
  },
  modelChatItem: {
    alignSelf: "flex-start",
    backgroundColor: "transparent",
  },
  chatText: {
    fontSize: 18,
    lineHeight: 24,
    color: "#1F2937",
  },
  typingIndicator: {
    color: "#1F2937",
    fontSize: 18,
    position: 'absolute',
    bottom: 16,
    right: 16,
    opacity: 0.5,
  }
});

export default ChatBubble;
