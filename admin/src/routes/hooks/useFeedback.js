import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllFeedbacks, 
  fetchFeedbackById, 
  fetchFeedbacksByUserId,
  clearFeedbacks,
  respondToFeedback 
} from '../../redux/feedbackSlice';

const useFeedback = () => {
  const dispatch = useDispatch();
  const { 
    feedbacks, 
    currentFeedback, 
    userFeedbacks, 
    loading, 
    error 
  } = useSelector((state) => state.feedback);

  const handleGetAllFeedbacks = useCallback(async () => {
    try {
      console.log('Fetching all feedbacks...');
      const result = await dispatch(fetchAllFeedbacks()).unwrap();
      console.log('Successfully fetched feedbacks:', result);
    } catch (error) {
      console.error('Error fetching all feedbacks:', error);
    }
  }, [dispatch]);

  const handleGetFeedbackById = useCallback(async (id) => {
    try {
      await dispatch(fetchFeedbackById(id)).unwrap();
    } catch (error) {
      console.error('Error fetching feedback by id:', error);
    }
  }, [dispatch]);

  const handleGetFeedbacksByUserId = useCallback(async (userId) => {
    try {
      await dispatch(fetchFeedbacksByUserId(userId)).unwrap();
    } catch (error) {
      console.error('Error fetching feedbacks by user id:', error);
    }
  }, [dispatch]);

  const handleRespondToFeedback = useCallback(async (feedbackId, responseText) => {
    try {
      const adminData = JSON.parse(sessionStorage.getItem('user'));
      
      if (!adminData || !adminData.Id) {
        throw new Error('Không tìm thấy thông tin admin');
      }

      const responseData = {
        feedbackId: Number(feedbackId),
        responseText,
        adminId: Number(adminData.Id)
      };

      console.log('Sending response data:', {
        feedbackId: typeof feedbackId,
        feedbackIdValue: feedbackId,
        responseText: typeof responseText,
        responseTextValue: responseText,
        adminId: typeof adminData.Id,
        adminIdValue: adminData.Id,
        fullResponseData: responseData
      });

      await dispatch(respondToFeedback(responseData)).unwrap();
      await dispatch(fetchAllFeedbacks()).unwrap();
    } catch (error) {
      console.error('Error responding to feedback:', error);
      throw error;
    }
  }, [dispatch]);

  const clearAllFeedbacks = useCallback(() => {
    dispatch(clearFeedbacks());
  }, [dispatch]);

  return {
    feedbacks,
    currentFeedback,
    userFeedbacks,
    loading,
    error,
    handleGetAllFeedbacks,
    handleGetFeedbackById,
    handleGetFeedbacksByUserId,
    handleRespondToFeedback,
    clearAllFeedbacks,
  };
};

export default useFeedback;