import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import ChatBubble from './ChatBubble'; // Assuming you have a ChatBubble component

const ChatBot = ({ sessionId }) => { // Pass sessionId as a prop
  const [chat, setChat] = useState([]); // Chat log
  const [userInput, setUserInput] = useState(''); // User input
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const API_KEY = 'AIzaSyA1qeItcA-tL9ZoxbihSC46LO-6vXphJAA'; // Replace with your API Key
  const flatListRef = useRef(null); // Create a reference for FlatList

  // Function to handle user input
  const handleUserInput = async () => {
    if (!userInput.trim()) return; // Ensure userInput is not empty

    let updatedChat = [...chat, { role: 'user', parts: [{ text: userInput }] }];
    setChat(updatedChat); // Update chat state to show user's message
    setUserInput(''); // Clear input box
    setLoading(true); // Show loading spinner

    try {
      const response = await makeApiCall(updatedChat, 0); // Call API with retry mechanism
      const modelResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || ''; 
      if (modelResponse) {
        const newChat = [...updatedChat, { role: 'model', parts: [{ text: modelResponse }] }];
        setChat(newChat);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  // Function to handle retry logic for API call
  const makeApiCall = async (updatedChat, retryCount) => {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
        {
          sessionId, // Include session ID for tracking
          contents: updatedChat.map(chatItem => ({
            role: chatItem.role,
            parts: chatItem.parts.map(part => ({ text: part.text }))
          }))
        }
      );
      return response;
    } catch (error) {
      if (error.response?.status === 429 && retryCount < 3) {
        // Wait for 1 second and retry up to 3 times
        await new Promise(resolve => setTimeout(resolve, 1000));
        return makeApiCall(updatedChat, retryCount + 1);
      } else {
        throw error; 
      }
    }
  };

  // Send an initial message when the view is opened
  useEffect(() => {
    const initialMessage = { role: 'model', parts: [{ text: 'Hello! I’m your English learning assistant. How can I help you today?' }] };
    setChat([initialMessage]);
  }, []);


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
        ref={flatListRef} 
        data={chat} 
        renderItem={renderChatItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })} 
        style={{ flexGrow: 1 }} 
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#aaa"
          value={userInput}
          onChangeText={text => setUserInput(text)} 
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
    backgroundColor: '#F5F7FB', // Màu nền nhẹ nhàng
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A2138',
    marginBottom: 24,
    marginTop: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  chatContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  input: {
    flex: 1,
    height: 50,
    marginRight: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    fontSize: 18,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  button: {
    height: 50,
    width: 50,
    backgroundColor: '#4F46E5',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  error: {
    color: '#DC2626',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default ChatBot;
