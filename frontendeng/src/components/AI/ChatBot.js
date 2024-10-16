import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import ChatBubble from './ChatBubble'; // Assuming you have a ChatBubble component

const ChatBot = () => {
  const [chat, setChat] = useState([]); // Chat log
  const [userInput, setUserInput] = useState(''); // User input
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const API_KEY = 'AIzaSyCcghcmfHSTa1_J40ZjbhAgtXbebeYFgrc'; // Replace with your API Key
  const flatListRef = useRef(null); // Create a reference for FlatList

  // Function to handle user input
  const handleUserInput = async () => {
    if (!userInput.trim()) return; // Ensure userInput is not empty

    let updatedChat = [...chat, { role: 'user', parts: [{ text: userInput }] }];
    setChat(updatedChat); // Update chat state to show user's message
    setUserInput(''); // Clear input box
    setLoading(true); // Show loading spinner

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
        {
          contents: updatedChat.map(chatItem => ({
            role: chatItem.role,
            parts: chatItem.parts.map(part => ({ text: part.text }))
          }))
        }
      );
      const modelResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || ''; 
      if (modelResponse) {
        const newChat = [...updatedChat, { role: 'model', parts: [{ text: modelResponse }] }];
        setChat(newChat);
      }
    } catch (error) {
      console.error('Error calling Gemini Pro API:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  // Send an initial message when the view is opened
  useEffect(() => {
    const initialMessage = { role: 'model', parts: [{ text: 'Hello! I’m your English learning assistant. How can I help you today?' }] };
    setChat([initialMessage]); // Add initial message to chat state
  }, []); // Empty array means this effect runs only once when the component mounts

  // Scroll to the end of the list when the chat updates
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [chat]);

  // Render a single chat bubble
  const renderChatItem = ({ item }) => (
    <ChatBubble role={item.role} text={item.parts[0].text} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>English Learning ChatBot</Text>
      <FlatList
        ref={flatListRef} // Attach the reference to FlatList
        data={chat} // Display all chat items (both user and model messages)
        renderItem={renderChatItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.chatContainer} // Adjust this style if necessary
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })} // Scroll on content size change
        style={{ flexGrow: 1 }} // Allow FlatList to expand and take available space
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#aaa"
          value={userInput}
          onChangeText={text => setUserInput(text)} // Update input
        />
        <TouchableOpacity style={styles.button} onPress={handleUserInput}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator style={styles.loading} color="#333" />}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 40,
    textAlign: 'center',
  },
  chatContainer: {
    flexGrow: 1,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    height: 50,
    marginRight: 10,
    padding: 8,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 25,
    color: '#333',
    backgroundColor: '#fff',
    fontSize: 18,
  },
  button: {
    padding: 10,
    backgroundColor: '#007AF',
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 18,
    color: 'blue',
    textAlign: 'center',
  },
  loading: {
    marginTop: 10,
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ChatBot;
