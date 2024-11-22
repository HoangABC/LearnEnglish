import { useDispatch, useSelector } from 'react-redux';
import { createFeedback, getFeedbacks, clearFeedbackError } from '../redux/feedbackSlice';

const  useFeedback = () => {
  const dispatch = useDispatch();
  const { feedbacks, loading, error } = useSelector((state) => state.feedback);

  const handleCreateFeedback = async (userId, feedbackText) => {
    try {
      const result = await dispatch(createFeedback({ userId, feedbackText })).unwrap();
      console.log('Create feedback result:', result);
      return result ? true : false;
    } catch (error) {
      console.error('Create feedback error:', error);
      return false;
    }
  };

  const handleGetFeedbacks = async (userId) => {
    try {
      await dispatch(getFeedbacks(userId)).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleClearError = () => {
    dispatch(clearFeedbackError());
  };

  return {
    feedbacks,
    loading,
    error,
    handleCreateFeedback,
    getFeedbacks: handleGetFeedbacks,
    clearError: handleClearError,
  };
};

export default useFeedback;