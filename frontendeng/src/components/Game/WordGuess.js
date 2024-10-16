import React, { useState, useEffect } from 'react'; 
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useGame from '../../hooks/useGame';
import Icon from 'react-native-vector-icons/Ionicons';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import ConfettiCannon from 'react-native-confetti-cannon';

const WordGuess = () => {
    const [userInput, setUserInput] = useState(Array.from({ length: 6 }, () => Array(5).fill('')));
    const [lockedRows, setLockedRows] = useState(Array(6).fill(false));
    const [gameOver, setGameOver] = useState(false);
    const [userId, setUserId] = useState(null);
    const [wordId, setWordId] = useState(null);
    const [isCorrect, setIsCorrect] = useState(false);
    const { fetchWordGuess, submitWordGuess, wordForGuess } = useGame();
    const [isValidWord, setIsValidWord] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [canInput, setCanInput] = useState(true);
    const [currentRow, setCurrentRow] = useState(0);
    const [cellColors, setCellColors] = useState(Array.from({ length: 6 }, () => Array(5).fill('#FFFFFF')));
    const [keyboardColors, setKeyboardColors] = useState({});
    const navigation = useNavigation();
    const [showConfetti, setShowConfetti] = useState(false);
    const [correctWord, setCorrectWord] = useState('');
    const [isUpdatingColors, setIsUpdatingColors] = useState(false);

    const fetchUserId = async () => {
        try {
            const userJson = await AsyncStorage.getItem('user');
            if (userJson) {
                const user = JSON.parse(userJson);
                setUserId(user.Id);
                fetchWordGuess(user.Id);
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

    useEffect(() => {
        if (wordForGuess) {
            setWordId(wordForGuess.wordId);
        }
    }, [wordForGuess]);

    const handlePlayAgain = () => {
        setUserInput(Array.from({ length: 6 }, () => Array(5).fill('')));
        setLockedRows(Array(6).fill(false));
        setGameOver(false);
        setIsValidWord(true);
        setCanInput(true);
        setCurrentRow(0);
        setCellColors(Array.from({ length: 6 }, () => Array(5).fill('#FFFFFF')));
        if (userId) {
            fetchWordGuess(userId);
        }
    };

    const handleLetterPress = (letter) => {
        if (!gameOver && canInput && !lockedRows[currentRow]) {
            const newInput = [...userInput];
            for (let colIndex = 0; colIndex < 5; colIndex++) {
                if (newInput[currentRow][colIndex] === '') {
                    newInput[currentRow][colIndex] = letter;
                    // Đổi màu nền ô khi nhập chữ
                    const updatedColors = [...cellColors];
                    updatedColors[currentRow][colIndex] = '#EEC591'; // Đặt màu nền ô là màu #EEC591
                    setCellColors(updatedColors);
                    break;
                }
            }
            setUserInput(newInput);
        }
    };

const handleRemovePress = () => {
    if (!gameOver && !lockedRows[currentRow]) {
        setUserInput((prevInput) => {
            const newInput = prevInput.map((row) => [...row]);
            for (let colIndex = newInput[currentRow].length - 1; colIndex >= 0; colIndex--) {
                if (newInput[currentRow][colIndex] !== '') {
                    newInput[currentRow][colIndex] = '';
                    // Đặt lại màu nền ô về màu trắng
                    const updatedColors = [...cellColors];
                    updatedColors[currentRow][colIndex] = '#FFFFFF';
                    setCellColors(updatedColors);
                    break;
                }
            }

            // Kiểm tra nếu từ hiện tại dưới 5 ký tự, đặt lại isValidWord thành true để hiển thị nút "Kiểm Tra"
            const currentWordLength = newInput[currentRow].join('').length;
            if (currentWordLength < 5) {
                setIsValidWord(true);
            }

            return newInput;
        });
    }
};


    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    const checkWordValidity = async (word) => {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const data = await response.json();
            return data.title !== "No Definitions Found";
        } catch (error) {
            console.error("Error checking word validity:", error);
            return false;
        }
    };

    const checkIfAllRowsIncorrect = () => {
        // Kiểm tra tất cả các ô trong cellColors
        return cellColors.every((row) => row.every((color) => color !== '#008000'));
    };
    
    const handleCheckManual = async () => {
        const answer = userInput[currentRow].join('');
    
        // Kiểm tra nếu đã nhập 6 dòng
        if (currentRow === 5) { // Nếu là dòng thứ 6
            if (answer.length < 5 || gameOver) {
                return;
            }
            
            const isValid = await checkWordValidity(answer);
            
            // Nếu không hợp lệ, hiển thị modal
            if (!isValid) {
                setIsValidWord(false);
                setModalVisible(true); // Hiện modal thông báo không hợp lệ
                return;
            }
    
            // Kiểm tra nếu có ô nào trong dòng thứ 6 không có màu xanh lá (#008000)
            const hasNonGreenCell = cellColors[currentRow].some((color) => color !== '#008000');
            if (hasNonGreenCell) {
                setModalVisible(true); // Hiện modal nếu có ô không phải màu xanh lá
                return;
            }
        } else {
            // Kiểm tra cho các dòng khác
            if (answer.length < 5 || gameOver) {
                return;
            }
    
            const isValid = await checkWordValidity(answer);
            if (!isValid) {
                setIsValidWord(false);
                return;
            }
        }
    
        await validateAndSubmitGuess(answer);
    };
    
    
    const animateCellColor = (rowIndex, colIndex, color) => {
        const animationDuration = 300;
        const animatedValue = new Animated.Value(0);
        
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: animationDuration,
            useNativeDriver: false,
        }).start(() => {
            const newColors = [...cellColors];
            newColors[rowIndex][colIndex] = color;
            setCellColors(newColors);
        });
    };

    const updateColorsForRow = async (answer, correctWord) => {
        setIsUpdatingColors(true); // Đang cập nhật màu sắc
        const newColors = [...cellColors];
        const answerChars = answer.split('');
        const correctChars = correctWord.split('');
        const rowColors = Array(5).fill('#000000');
        const newKeyboardColors = { ...keyboardColors };
    
        // Đánh dấu màu cho vị trí đúng
        answerChars.forEach((char, index) => {
            if (char === correctChars[index]) {
                rowColors[index] = '#008000';
                correctChars[index] = null;
                newKeyboardColors[char] = { backgroundColor: '#008000', textColor: '#FFFFFF' };
            }
        });
    
        // Đánh dấu màu cho các chữ cái không đúng
        answerChars.forEach((char, index) => {
            if (correctChars.includes(char) && rowColors[index] !== '#008000') {
                rowColors[index] = '#FFA500';
                if (!newKeyboardColors[char] || newKeyboardColors[char].backgroundColor !== '#008000') {
                    newKeyboardColors[char] = { backgroundColor: '#FFA500', textColor: '#000000' };
                }
            } else if (!correctChars.includes(char)) {
                if (!newKeyboardColors[char] || newKeyboardColors[char].backgroundColor !== '#008000') {
                    newKeyboardColors[char] = { backgroundColor: '#000000', textColor: '#FFFFFF' };
                }
            }
        });
    
        for (let index = 0; index < rowColors.length; index++) {
            await new Promise((resolve) => {
                setTimeout(() => {
                    animateCellColor(currentRow, index, rowColors[index]);
                    resolve();
                }, 300);
            });
        }
    
        setKeyboardColors(newKeyboardColors);
    
        if (currentRow === 5 && checkIfAllRowsIncorrect()) {
            setModalVisible(true);
        }
    
        setIsUpdatingColors(false); // Đã cập nhật xong
    };
    
    
    const validateAndSubmitGuess = async (answer) => {
        try {
            const isValid = await checkWordValidity(answer);
            if (!isValid) {
                setIsValidWord(false);
                return;
            } else {
                setIsValidWord(true);
            }
    
            if (userId && wordId) {
                const response = await submitWordGuess(userId, wordId, answer);
                console.log('API',response)
                if (response && response.payload) {
                    const correctWord = response.payload.word.toUpperCase();
                     setCorrectWord(correctWord);
                    // Chờ cho việc cập nhật màu sắc hoàn thành trước khi tiếp tục
                    await updateColorsForRow(answer, correctWord);
    
                    setIsCorrect(response.payload.isCorrect);
    
                    if (response.payload.isCorrect) {
                        setShowConfetti(true);
                        setModalVisible(true); // Hiển thị modal khi người dùng thắng
                    } else if (currentRow === 5) { // Nếu dòng cuối cùng
                        setModalVisible(true); // Hiển thị modal nếu hết dòng
                    }
    
                    setLockedRows((prev) => {
                        const newLockedRows = [...prev];
                        newLockedRows[currentRow] = true;
                        return newLockedRows;
                    });
    
                    // Kiểm tra xem currentRow có hợp lệ không trước khi tăng lên
                    if (currentRow < userInput.length - 1) {
                        setCurrentRow((prevRow) => prevRow + 1);
                    }
                    setCanInput(true);
                }
            }
        } catch (error) {
            console.error("Có lỗi xảy ra khi gửi câu trả lời:", error);
        }
    };
    
    
    const handleNext = () => {
        setUserInput(Array.from({ length: 6 }, () => Array(5).fill('')));
        setCellColors(Array.from({ length: 6 }, () => Array(5).fill('#FFFFFF'))); 
        setCurrentRow(0); 
        setCanInput(true); 
        setLockedRows(Array(6).fill(false)); 
        setModalVisible(false); 
        setKeyboardColors({}); 
        setShowConfetti(false); // Ẩn confetti khi chơi lại
        if (userId) {
            fetchWordGuess(userId); 
        }
    };
    

    const isCurrentRowValid = currentRow >= 0 && currentRow < userInput.length && userInput[currentRow].join('').length === 5;


    return (  
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content
                    title={(
                    <View style={styles.progressContainer}>
                       
                    </View>
                    )}
                />
            </Appbar.Header>
            <View style={styles.inputContainer}>
                {userInput.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.inputRow}>
                        {row.map((inputChar, colIndex) => (
                            <View 
                                key={colIndex} 
                                style={[styles.inputBox, { backgroundColor: cellColors[rowIndex][colIndex] }]}
                            >
                                <Text 
                                    style={[
                                        styles.inputText, 
                                        { color: cellColors[rowIndex][colIndex] !== '#FFFFFF' ? '#FFFFFF' : '#000000' }
                                    ]}
                                >
                                    {inputChar}
                                </Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
            <View style={styles.keyboardContainer}>
            {letters.map((letter) => (
                <TouchableOpacity
                    key={letter}
                    style={[
                        styles.key,
                        { backgroundColor: keyboardColors[letter]?.backgroundColor || '#EEC591' }, // Màu nền của bàn phím
                    ]}
                    onPress={() => handleLetterPress(letter)}
                >
                    <Text style={[styles.keyText, { color: keyboardColors[letter]?.textColor || '#000000' }]}>
                        {letter}
                    </Text>
                </TouchableOpacity>
            ))}
                <TouchableOpacity style={styles.key} onPress={handleRemovePress}>
                    <Icon name="backspace" size={30} />
                </TouchableOpacity>
            </View>
            <TouchableOpacity 
                onPress={handleCheckManual} 
                disabled={!isCurrentRowValid || isUpdatingColors} 
                style={[
                    styles.submitButton, 
                    { backgroundColor: !isValidWord ? 'red' : (isUpdatingColors || !isCurrentRowValid ? '#AAAAAA' : '#0000FF') }
                ]}
            >
                <Text style={styles.submitButtonText}>
                    {isValidWord ? "SUBMIT" : "NOT A WORD"}
                </Text>
            </TouchableOpacity>


            <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>
                    {isCorrect ? "LEVEL SUCCESS" : "LEVEL FAILED"}
                    </Text>
                    {isCorrect && (
                    <View style={styles.correctAnswerContainer}>
                        <Text style={styles.correctAnswerText}>The correct answer is:</Text>
                        <View style={styles.correctWordContainer}>
                        {correctWord.split('').map((char, index) => (
                            <View key={index} style={styles.charBox}>
                            <Text style={styles.correctChar}>{char}</Text>
                            </View>
                        ))}
                        </View>
                    </View>
                    )}
                    {showConfetti && (
                    <ConfettiCannon
                        count={200} // Số lượng confetti
                        origin={{ x: -10, y: 0 }} // Vị trí xuất phát
                    />
                    )}
                    <TouchableOpacity style={styles.playNext} onPress={handleNext}>
                        <Text style={styles.playNextText}>PLAY NEXT</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F5DEB3',
    },
    header: {
        width: '100%',
        backgroundColor: '#F5DEB3',
        
    },
    
    inputContainer: {
        flexDirection: 'column',
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: 'row',
    },
    inputBox: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
        borderRadius:5
    },
    inputText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    keyboardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingBottom: 20,
    },
    key: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
        backgroundColor: '#EEC591', 
        borderRadius: 5,
    },
    keyText: {
        fontSize: 18,
    },
    keyPressed: {
        backgroundColor: '#888',
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Add a dim background
      },
      modalText: {
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 30,
        color: '#FFFFFF', // Text color in modal
        fontFamily: 'Arial', // Font family for consistency
      },
      textWhite: {
        color: 'white',
      },
      correctAnswerContainer: {
        marginTop: 20,
        alignItems: 'center',
        fontWeight: 'bold',
        padding:20,
      },
      correctAnswerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'Arial', // Font family for consistency
      },
      correctWordContainer: {
        flexDirection: 'row', // Ensure characters are laid out horizontally
        marginTop: 10,
      },
      charBox: {
        width: 40,  // Fixed width
        height: 40,  // Fixed height
        borderWidth: 1,
        borderColor: '#000',  // Border color
        justifyContent: 'center',  // Center vertically
        alignItems: 'center',  // Center horizontally
        marginHorizontal: 2,  // Space between boxes
        backgroundColor: '#33CC00',  // Background color
        borderRadius: 5,  // Rounded corners
      },
      correctChar: {
        fontSize: 24,  // Font size
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'Arial', // Font family for consistency
      },
      playNext: {
        width: '40%', // Full width
        borderRadius: 10, // Rounded corners
        backgroundColor: '#A020F0', // Purple background
        paddingVertical: 10, // Vertical padding
        paddingHorizontal: 20, // Horizontal padding
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
        marginVertical: 10, // Vertical margin
      },
      playNextText: {
        color: '#FFFFFF', // White text
        fontWeight: 'bold', // Bold text
        fontSize: 20, // Font size
        textAlign: 'center', // Centered text
        fontFamily: 'Arial',
      },
      submitButton: {
        width: '50%', // Full width
        borderRadius: 10, // Rounded corners
        backgroundColor: '#0000FF', // Blue background
        paddingVertical: 10, // Vertical padding
        paddingHorizontal: 20, // Horizontal padding
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
        marginVertical: 10, // Vertical margin
      },
      submitButtonText: {
        color: '#FFFFFF', // White text
        fontWeight: 'bold', // Bold text
        fontSize: 20, // Larger font size for thicker appearance
        textAlign: 'center', // Centered text
        fontFamily: 'Arial', // Font family for consistency
      },
    
});

export default WordGuess;
