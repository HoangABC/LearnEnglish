import React, { useState, useEffect } from 'react'; 
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useGame from '../../hooks/useGame';
import Icon from 'react-native-vector-icons/Ionicons';
import { Appbar } from 'react-native-paper';
import { useNavigation, useRoute  } from '@react-navigation/native';
import ConfettiCannon from 'react-native-confetti-cannon';
import wordList from '../../data/wordList.json';

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
    const route = useRoute();
    const { selectedLevel } = route.params;
    const [isResetting, setIsResetting] = useState(false);
    const [shouldFetchWord, setShouldFetchWord] = useState(false);

    useEffect(() => {
        fetchUserId();
    }, []);
    
    const fetchUserId = async () => {
        try {
            const userJson = await AsyncStorage.getItem('user');
            if (userJson) {
                const user = JSON.parse(userJson);
                setUserId(user.Id);
    
                // Đợi fetchWordGuess hoàn thành
                const fetchedWord = await fetchWordGuess(user.Id); 
                if (fetchedWord && fetchedWord.original) {
                    setCorrectWord(fetchedWord.original.toUpperCase());
                    setWordId(fetchedWord.wordId);
                }
            } else {
                console.error("User not found in AsyncStorage");
            }
        } catch (error) {
            console.error("Error fetching userId from AsyncStorage:", error);
        }
    };
    
    
    useEffect(() => {
        if (shouldFetchWord && userId) {
            fetchWordGuess(userId);
            setShouldFetchWord(false);
        }
    }, [shouldFetchWord, userId, fetchWordGuess]);

    useEffect(() => {
        const initializeGame = async () => {
            if (wordForGuess && wordForGuess.original) {
                console.log('Fetched word for guessing:', wordForGuess);
                setWordId(wordForGuess.wordId);
                setCorrectWord(wordForGuess.original.toUpperCase());
                
                // Lấy level từ AsyncStorage và tạo màu ngay lập tức
                try {
                    const storedLevel = await AsyncStorage.getItem('currentLevel');
                    const level = storedLevel || 'normal';
                    console.log('Current level:', level); // Log để debug

                    const incorrectLetterCount = level === 'easy' ? 3 : 
                                               level === 'normal' ? 2 : 0;
                    
                    console.log('Incorrect letter count:', incorrectLetterCount); // Log để debug
                    
                    if (incorrectLetterCount > 0) {
                        const newWord = wordForGuess.original.toUpperCase();
                        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
                        const correctLetters = newWord.split('');
                        const incorrectLetters = letters.filter(letter => !correctLetters.includes(letter));
                        
                        const selectedIncorrectLetters = [];
                        while (selectedIncorrectLetters.length < incorrectLetterCount) {
                            const randomIndex = Math.floor(Math.random() * incorrectLetters.length);
                            const randomLetter = incorrectLetters[randomIndex];
                            if (!selectedIncorrectLetters.includes(randomLetter)) {
                                selectedIncorrectLetters.push(randomLetter);
                            }
                        }

                        console.log('Selected incorrect letters:', selectedIncorrectLetters); // Log để debug

                        const newKeyboardColors = {};
                        selectedIncorrectLetters.forEach((char) => {
                            newKeyboardColors[char] = { backgroundColor: '#FF0000', textColor: '#FFFFFF' };
                        });
                        setKeyboardColors(newKeyboardColors);
                    }
                } catch (error) {
                    console.error("Error getting level from AsyncStorage:", error);
                }
            }
        };

        initializeGame();
    }, [wordForGuess]);

    useEffect(() => {
        // Kiểm tra mức độ khó và chỉ đổi màu bàn phím sau khi correctWord đã được fetch
        if (correctWord && correctWord.length > 0 && selectedLevel && !isResetting) {
            changeKeyboardColorsBasedOnLevel(selectedLevel);
        }
    }, [correctWord, selectedLevel, isResetting]);
    
    const changeKeyboardColorsBasedOnLevel = (level) => {
        let incorrectLetterCount = 0;
    
        if (level === 'easy') {
            incorrectLetterCount = 3;
        } else if (level === 'normal') {
            incorrectLetterCount = 2;
        } else if (level === 'hard') {
            return; // Hard level không cần đổi màu
        }
    
        if (correctWord && correctWord.length > 0) {
            console.log('Setting colors for level:', level, 'with count:', incorrectLetterCount);
            const incorrectLetters = getRandomIncorrectLetters(incorrectLetterCount);
            const newKeyboardColors = {};
            incorrectLetters.forEach((char) => {
                newKeyboardColors[char] = { backgroundColor: '#FF0000', textColor: '#FFFFFF' };
            });
            setKeyboardColors(newKeyboardColors);
        }
    };
    
    const getRandomIncorrectLetters = (count) => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const correctLetters = correctWord.split('');
    
        // Lọc ra các ký tự không có trong correctWord
        const incorrectLetters = letters.filter((letter) => !correctLetters.includes(letter));
    
        // Chọn ngẫu nhiên 'count' ký tự không có trong correctWord
        const selectedIncorrectLetters = [];
        while (selectedIncorrectLetters.length < count) {
            const randomIndex = Math.floor(Math.random() * incorrectLetters.length);
            const randomLetter = incorrectLetters[randomIndex];
            if (!selectedIncorrectLetters.includes(randomLetter)) {
                selectedIncorrectLetters.push(randomLetter);
            }
        }
    
        return selectedIncorrectLetters;
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

    const checkWordValidity = (word) => {
        // Convert word to lowercase to match dictionary format
        const lowercaseWord = word.toLowerCase();
        // Check if the word exists in our word list
        return wordList.includes(lowercaseWord);
    };

    const checkIfAllRowsIncorrect = () => {
        // Kiểm tra tất cả các ô trong cellColors
        return cellColors.every((row) => row.every((color) => color !== '#008000'));
    };
    
    const handleCheckManual = async () => {
        const answer = userInput[currentRow].join('');
    
        if (currentRow === 5) {
            if (answer.length < 5 || gameOver) {
                return;
            }
            
            const isValid = checkWordValidity(answer);
            
            if (!isValid) {
                setIsValidWord(false);
                setModalVisible(true);
                return;
            }

            // Đợi validateAndSubmitGuess hoàn thành trước khi kiểm tra và hiện modal
            await validateAndSubmitGuess(answer);
            
            // Di chuyển kiểm tra hasNonGreenCell và hiện modal vào sau khi đã cập nhật màu
            const hasNonGreenCell = cellColors[currentRow].some((color) => color !== '#008000');
            if (hasNonGreenCell) {
                setModalVisible(true);
            }
        } else {
            if (answer.length < 5 || gameOver) {
                return;
            }

            const isValid = checkWordValidity(answer);
            if (!isValid) {
                setIsValidWord(false);
                return;
            }

            await validateAndSubmitGuess(answer);
        }
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
        return new Promise((resolve) => {
            setIsUpdatingColors(true);
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

            // Cập nhật màu tuần tự cho từng ô
            let updateCount = 0;
            rowColors.forEach((color, index) => {
                setTimeout(() => {
                    animateCellColor(currentRow, index, color);
                    setKeyboardColors((prev) => ({
                        ...prev,
                        [answerChars[index]]: newKeyboardColors[answerChars[index]],
                    }));
                    updateCount++;
                    if (updateCount === rowColors.length) {
                        setIsUpdatingColors(false);
                        resolve(); // Resolve promise khi tất cả màu đã được cập nhật
                    }
                }, index * 500); // Delay 500ms cho mỗi ô
            });
        });
    };
    
    
    
    const validateAndSubmitGuess = async (answer) => {
        try {
            const isValid = checkWordValidity(answer);
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

                    // Đợi cho việc cập nhật màu sắc hoàn thành
                    await updateColorsForRow(answer, correctWord);

                    setIsCorrect(response.payload.isCorrect);

                    // Sau khi cập nhật màu xong mới hiển thị modal
                    if (response.payload.isCorrect) {
                        setShowConfetti(true);
                        setModalVisible(true);
                    } else if (currentRow === 5) {
                        // Kiểm tra nếu tất cả các ô không phải màu xanh
                        if (checkIfAllRowsIncorrect()) {
                            setModalVisible(true);
                        }
                    }

                    setLockedRows((prev) => {
                        const newLockedRows = [...prev];
                        newLockedRows[currentRow] = true;
                        return newLockedRows;
                    });

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
    
    const handleNext = async () => {
        setIsResetting(true);
        
        // Reset states
        setUserInput(Array.from({ length: 6 }, () => Array(5).fill('')));
        setCellColors(Array.from({ length: 6 }, () => Array(5).fill('#FFFFFF')));
        setCurrentRow(0);
        setCanInput(true);
        setLockedRows(Array(6).fill(false));
        setModalVisible(false);
        setShowConfetti(false);
        setCorrectWord('');
        setKeyboardColors({});

        // Fetch từ mới
        if (userId) {
            const fetchedWord = await fetchWordGuess(userId);
            if (fetchedWord && fetchedWord.original) {
                setCorrectWord(fetchedWord.original.toUpperCase());
                setWordId(fetchedWord.wordId);
                setIsResetting(false);
                // Không cần setTimeout ở đây vì useEffect sẽ xử lý việc tạo màu
            }
        }
    };
    
     
    const isCurrentRowValid = currentRow >= 0 && currentRow < userInput.length && userInput[currentRow].join('').length === 5;

    // Thêm useEffect để xử lý cleanup khi unmount component
    useEffect(() => {
        return () => {
            // Cleanup function - sẽ chạy khi component unmount
            const removeStoredLevel = async () => {
                try {
                    await AsyncStorage.removeItem('currentLevel');
                    console.log('Removed stored level');
                } catch (error) {
                    console.error("Error removing stored level:", error);
                }
            };
            removeStoredLevel();
        };
    }, []);

    // Sửa lại useEffect khi nhận selectedLevel từ route
    useEffect(() => {
        if (selectedLevel) {
            const initializeLevel = async () => {
                try {
                    // Xóa level cũ (nếu có) trước khi lưu level mới
                    await AsyncStorage.removeItem('currentLevel');
                    // Lưu level mới
                    await AsyncStorage.setItem('currentLevel', selectedLevel);
                    console.log('Saved new level:', selectedLevel);
                } catch (error) {
                    console.error("Error handling level:", error);
                }
            };
            initializeLevel();
        }
    }, [selectedLevel]);

    return (  
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
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
                                        { color: cellColors[rowIndex][colIndex] === '#EEC591' ? '#000000' : '#FFFFFF' }
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
                    <View style={styles.correctAnswerContainer}>
                        <Text style={styles.correctAnswerText}>The correct answer is:</Text>
                        <View style={styles.correctWordContainer}>
                        {correctWord.split('').map((char, index) => (
                            <View key={index} style={[styles.charBox, { backgroundColor: '#008000' }]}>
                            <Text style={styles.correctChar}>{char}</Text>
                            </View>
                        ))}
                        </View>
                    </View>
                    {showConfetti && (
                    <ConfettiCannon
                        count={200}
                        origin={{ x: -10, y: 0 }}
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalText: {
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 30,
        color: '#FFFFFF',
    },
    correctAnswerContainer: {
        marginTop: 20,
        alignItems: 'center',
        padding: 20,
    },
    correctAnswerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
    },
    correctWordContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    charBox: {
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 2,
        backgroundColor: '#008000',
        borderRadius: 5,
    },
    correctChar: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    playNext: {
        width: '40%',
        borderRadius: 10,
        backgroundColor: '#A020F0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    playNextText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center',
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