import React from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import useCreateWord from '../hooks/useCreateWord';

const CreateWord = () => {
  const {
    word,
    definition,
    phoneticUK,
    phoneticUS,
    audioUK,
    audioUS,
    example,
    setWord,
    setDefinition,
    setPhoneticUK,
    setPhoneticUS,
    setAudioUK,
    setAudioUS,
    setExample,
    handleSubmit,
    error,
    loading,
  } = useCreateWord();

  React.useEffect(() => {
    if (error) {
      Alert.alert('Lỗi', error);
    }
  }, [error]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nhập từ"
        value={word}
        onChangeText={setWord}
      />
     
      <Button
        title={loading ? 'Đang lưu...' : 'Lưu từ vựng'}
        onPress={handleSubmit}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});

export default CreateWord;
