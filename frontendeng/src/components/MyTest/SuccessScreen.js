import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const SuccessScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  // Lấy score và totalQuestions từ route.params
  const { score, totalQuestions } = route.params || { score: 0, totalQuestions: 0 }; 

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Chúc mừng bạn!</Text>
      <Text style={{ fontSize: 18, marginTop: 20 }}>
        Bạn đã trả lời đúng {score} câu ({((score / totalQuestions) * 100).toFixed(2)}%)
      </Text>
      <Button title="Quay lại màn hình chính" onPress={() => navigation.navigate('Home')} />
    </View>
  );
};

export default SuccessScreen;
