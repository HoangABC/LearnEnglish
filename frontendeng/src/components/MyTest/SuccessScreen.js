import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const SuccessScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { score, totalQuestions } = route.params || { score: 0, totalQuestions: 0 }; 

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Chúc mừng bạn! 🎉</Text>
        <Text style={styles.scoreText}>
          Bạn đã trả lời đúng
        </Text>
        <Text style={styles.score}>{score}/{totalQuestions}</Text>
        <Text style={styles.percentage}>
          ({((score / totalQuestions) * 100).toFixed(2)}%)
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>Quay lại màn hình chính</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 10,
  },
  percentage: {
    fontSize: 24,
    color: '#27ae60',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#3498db',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SuccessScreen;
