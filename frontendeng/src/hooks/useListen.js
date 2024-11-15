import { useDispatch, useSelector } from 'react-redux';
import { fetchListeningPractice, submitListeningPractice, resetSubmitSuccess } from '../redux/listenSlice';

const useListen = () => {
  const dispatch = useDispatch();
  
  // State selectors
  const {
    listeningPracticeData,
    isLoading,
    error,
    submitSuccess,
  } = useSelector((state) => state.listen);

  // Fetch listening practice questions
  const fetchPractice = (userId) => {
    dispatch(fetchListeningPractice(userId));
  };

  // Submit listening practice answers
  const submitPractice = (userId, answer) => {
    dispatch(submitListeningPractice({ userId, questionId: listeningPracticeData.questionId, answer }));
  };
  

  // Reset submission success flag
  const resetSubmitFlag = () => {
    dispatch(resetSubmitSuccess());
  };

  return {
    listeningPracticeData,
    isLoading,
    error,
    submitSuccess,
    fetchPractice,
    submitPractice,
    resetSubmitFlag,
  };
};

export default useListen;
