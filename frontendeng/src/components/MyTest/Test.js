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
  const [isSubmitted, setIsSubmitted] = useState(false); // Trạng thái đã nộp bài
  const [showResults, setShowResults] = useState(false); // Trạng thái hiển thị kết quả

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
    marginTop: 20,
  },
  questionBox: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  selectedQuestionBox: {
    backgroundColor: '#1e88e5',
  },
  questionBoxText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  answeredQuestionBox: {
    backgroundColor: '#ffc107', 
  },
  questionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 80, 
    maxHeight: 120, 
  },
  questionText: {
    fontSize: 18,
    marginBottom: 10,
    lineHeight: 22,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedOptionButton: {
    backgroundColor: '#64b5f6',
  },
  optionText: {
    fontSize: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navigationText: {
    fontSize: 16,
    color: '#007aff',
  },
  submitButton: {
    position: 'absolute', 
    bottom: 0, 
    left: 20,
    right: 20,
    padding: 15,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20, 
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
