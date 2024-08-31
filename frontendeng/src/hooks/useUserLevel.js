import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { updateUserLevel, fetchLevels } from '../redux/authSlice';

const useUserLevel = () => {
  const dispatch = useDispatch();
  const { status, error, levels } = useSelector((state) => state.auth);

  const [updateStatus, setUpdateStatus] = useState('idle');
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    dispatch(fetchLevels());
  }, [dispatch]);

  const setUserLevel = async (Id, levelId) => {  // Đổi userId thành Id
    setUpdateStatus('loading');
    try {
      await dispatch(updateUserLevel({ id: Id, levelId })).unwrap();  // Gọi API với Id
      setUpdateStatus('succeeded');
    } catch (err) {
      setUpdateStatus('failed');
      setUpdateError(err.message || 'Failed to update user level');
    }
  };

  return {
    setUserLevel,
    status,
    error,
    levels,
    updateStatus,
    updateError,
  };
};

export default useUserLevel;
