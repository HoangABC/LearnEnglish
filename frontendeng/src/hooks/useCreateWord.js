import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addWord } from '../redux/wordSlice'; // Đảm bảo rằng đường dẫn đúng

const useCreateWord = () => {
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [phoneticUK, setPhoneticUK] = useState('');
  const [phoneticUS, setPhoneticUS] = useState('');
  const [audioUK, setAudioUK] = useState('');
  const [audioUS, setAudioUS] = useState('');
  const [example, setExample] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await dispatch(addWord({ 
        word, 
        definition, 
        phoneticUK, 
        phoneticUS, 
        audioUK, 
        audioUS, 
        example 
      })).unwrap();
      console.log('Add Word Result:', result);
      setWord('');
      setDefinition('');
      setPhoneticUK('');
      setPhoneticUS('');
      setAudioUK('');
      setAudioUS('');
      setExample('');
    } catch (error) {
      console.error('Add Word Error:', error);
      setError(error.message || 'Có lỗi xảy ra khi thêm từ vựng');
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};

export default useCreateWord;
