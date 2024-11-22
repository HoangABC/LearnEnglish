import React, { useEffect, useState } from 'react';  
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useTest from '../../hooks/useTest'; // Import custom hook useTest
import { useNavigation } from '@react-navigation/native';

const Test = () => {
  const { tests, error, newLevelId, fetchUserTests, submitUserQuiz } = useTest();
  const [userId, setUserId] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const navigation = useNavigation();
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false); 
  const [showResults, setShowResults] = useState(false);

  const fetchUserId = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserId(user.Id);
        fetchUserTests(user.Id); 
      } else {
        console.error("User not found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error fetching userId from AsyncStorage:", error);
    }
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  if (error) {
    const errorMessage = typeof error === 'string' ? error : JSON.stringify(error);
    return <Text style={styles.errorText}>Error: {errorMessage}</Text>;
  }

  if (!tests.length) {
    return <Text style={styles.errorText}>No tests available</Text>;
  }

  const currentQuestion = tests[currentQuestionIndex]; 

  const handleAnswerSelection = (questionId, answerId) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = { questionId, answerId, isAnswered: true }; 
    setAnswers(updatedAnswers);
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < tests.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const countCorrectAnswers = () => {
    let correctCount = 0;
    answers.forEach((answer, index) => {
      const currentQuestion = tests[index];
      if (currentQuestion.correctAnswerId === answer.answerId) {
        correctCount++;
      }
    });
    return correctCount;
  };

const handleSubmit = async () => {
  if (userId && answers.length === tests.length) {
    const correctAnswersCount = countCorrectAnswers();
    const currentTotalQuestions = tests.length; 
    setScore(correctAnswersCount);
    setTotalQuestions(currentTotalQuestions); 
    setIsSubmitted(true); 
    setShowResults(true); 

    await submitUserQuiz(userId, answers);

    Alert.alert("Bạn cần làm tốt hơn!", "Số câu đúng là: " + correctAnswersCount + "/" + currentTotalQuestions);
  } else {
    Alert.alert("Vui lòng trả lời tất cả các câu hỏi trước khi nộp bài.");
  }
};


const handleComplete = (correctAnswersCount, totalQuestions) => {
  setIsSubmitted(false); 
  setCurrentQuestionIndex(0);
  setAnswers([]); 
  setShowResults(false); 
  fetchUserTests(userId); 

  if (correctAnswersCount >= 7) {
    navigation.navigate('SuccessScreen', {
      score: correctAnswersCount,
      totalQuestions: totalQuestions,
      newLevelId: newLevelId,
    });
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Câu hỏi trắc nghiệm</Text>
      
      {isSubmitted && showResults ? ( // Hiển thị kết quả nếu isSubmitted và showResults đều là true
        <ScrollView style={styles.resultContainer}>
          {tests.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer?.answerId === question.correctAnswerId;
            return (
              <View key={index} style={styles.questionReview}>
                <Text style={styles.questionText}>
                  Câu {index + 1}: {question.questionText}
                </Text>
                {question.answers.map((answer) => (
                  <Text
                    key={answer.answerId}
                    style={[styles.answerText,
                      userAnswer?.answerId === answer.answerId
                        ? isCorrect
                          ? styles.correctAnswer
                          : styles.incorrectAnswer
                        : null,
                      question.correctAnswerId === answer.answerId
                        ? styles.correctAnswerHighlight
                        : null
                    ]}
                  >
                    {answer.answerText}
                  </Text>
                ))}
              </View>
            );
          })}

        <TouchableOpacity 
          style={styles.completeButton} 
          onPress={() => handleComplete(score, totalQuestions)} 
        >
          <Text style={styles.completeButtonText}>Xong</Text>
        </TouchableOpacity>

        </ScrollView>
      ) : (
        <>
          <ScrollView style={styles.questionContainer}>
            <Text style={styles.questionText}>
              <Text style={{ fontWeight: 'bold' }}>Câu {currentQuestionIndex + 1}: </Text>
              <Text>{currentQuestion.questionText}</Text>
            </Text>
          </ScrollView>

          <View style={styles.optionsContainer}>
            {currentQuestion.answers.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton,
                  answers[currentQuestionIndex]?.answerId === option.answerId && styles.selectedOptionButton,
                ]}
                onPress={() => handleAnswerSelection(currentQuestion.questionId, option.answerId)}
              >
                <Text style={styles.optionText}>{option.answerText}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.navigationButtons}>
            <TouchableOpacity onPress={handlePrevious} disabled={currentQuestionIndex === 0}>
              <Text style={styles.navigationText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} disabled={currentQuestionIndex === tests.length - 1}>
              <Text style={styles.navigationText}>Next</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.questionListContainer}>
            <FlatList
              horizontal
              data={tests}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[styles.questionBox, currentQuestionIndex === index && styles.selectedQuestionBox, answers[index]?.isAnswered && styles.answeredQuestionBox]}
                  onPress={() => setCurrentQuestionIndex(index)} // Chọn câu hỏi
                >
                  <Text style={styles.questionBoxText}>{index + 1}</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Nộp bài</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  questionListContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    paddingHorizontal: 5,
  },
  questionBox: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedQuestionBox: {
    backgroundColor: '#2196F3',
    borderColor: '#1976D2',
  },
  questionBoxText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
  },
  answeredQuestionBox: {
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C',
  },
  questionContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 100,
    maxHeight: 150,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#2c3e50',
    fontWeight: '500',
  },
  optionsContainer: {
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  optionButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedOptionButton: {
    backgroundColor: '#2196F3',
    borderColor: '#1976D2',
  },
  optionText: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '400',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  navigationText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  submitButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
  },
  questionReview: {
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
  },
  correctAnswer: {
    color: 'green',
  },
  incorrectAnswer: {
    color: 'red',
    textDecorationLine: 'line-through',
  },
  correctAnswerHighlight: {
    fontWeight: 'bold',
    color: 'green',
  },
  completeButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Test;
