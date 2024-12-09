import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Keyboard } from 'react-native';
import axios from 'axios';
import ChatBubble from './ChatBubble'; 
import { GEMINI_API_KEY, GEMINI_API_URL } from '@env';

const ChatBot = ({ sessionId }) => { 
  const [chat, setChat] = useState([]); 
  const [userInput, setUserInput] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 
  const flatListRef = useRef(null); 
  const [isResponding, setIsResponding] = useState(false);
  const abortControllerRef = useRef(null);

  const handleUserInput = async () => {
    if (!userInput.trim()) return;
    
    Keyboard.dismiss();
    
    let updatedChat = [...chat, { role: 'user', parts: [{ text: userInput }] }];
    setChat(updatedChat); 
    setUserInput(''); 
    setLoading(true); 
    setIsResponding(true);
    
    try {
      const response = await makeApiCall(updatedChat, 0); 
      const modelResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || ''; 
      if (modelResponse) {
        const newChat = [...updatedChat, { role: 'model', parts: [{ text: modelResponse }] }];
        setChat(newChat);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
      setIsResponding(false);
    }
  };

  const makeApiCall = async (updatedChat, retryCount) => {
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: 'model',
              parts: [{
                text: `Bạn là một trợ lý học tiếng Anh thân thiện và chuyên nghiệp. 
                
                Quy tắc trả lời:
                1. CHỈ trả lời các câu hỏi liên quan đến học tiếng Anh
                2. Nếu câu hỏi KHÔNG liên quan đến tiếng Anh, trả lời: "Xin lỗi, tôi chỉ có thể giúp bạn với các vấn đề học tiếng Anh. Bạn có thể hỏi về từ vựng, ngữ pháp, phát âm hoặc các chủ đề học tiếng Anh khác."
                3. Trả lời bằng tiếng Việt để người học dễ hiểu
                4. Giải thích ngắn gọn, rõ ràng và đưa ra ví dụ cụ thể
  
                Phạm vi hỗ trợ:
                - Từ vựng và cách sử dụng
                - Ngữ pháp và cấu trúc câu
                - Giải thích thành ngữ`
              }]
            },
            ...updatedChat.map(chatItem => ({
              role: chatItem.role,
              parts: chatItem.parts.map(part => ({ text: part.text }))
            }))
          ]
        }
      );
      return response;
    } catch (error) {
      if (error.response?.status === 429 && retryCount < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return makeApiCall(updatedChat, retryCount + 1);
      } else {
        throw error;
      }
    }
  };

  const handleStopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsResponding(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialMessage = { role: 'model', parts: [{ text: 'Xin chào! Tôi là trợ lý học tiếng Anh của bạn. Tôi có thể giúp gì cho bạn hôm nay?' }] };
    setChat([initialMessage]);
  }, []);


  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [chat]);

  const renderChatItem = ({ item }) => (
    <ChatBubble role={item.role} text={item.parts[0].text} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>English Learning ChatBot</Text>
      <View style={styles.chatWrapper}>
        <FlatList
          ref={flatListRef} 
          data={chat} 
          renderItem={renderChatItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })} 
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Type your message..."
          multiline={true}
          numberOfLines={1}
          maxHeight={100}
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleUserInput}
        >
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator style={styles.loading} color="#333" />}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB', 
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
  chatWrapper: {
    flex: 1,
    marginBottom: 60,
  },
  chatContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    minHeight: 40,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4B5563',
    borderRadius: 20,
    padding: 10,
    minWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
  stopButton: {
    backgroundColor: '#DC2626', 
  },
});

export default ChatBot;
