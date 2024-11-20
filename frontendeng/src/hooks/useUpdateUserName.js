import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { updateUserName } from '../redux/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';

const useUpdateUserName = () => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const updateName = async (newName) => {
    try {
      const user = await AsyncStorage.getItem('user');
      
      if (user) {
        const parsedUser = JSON.parse(user);
        const userId = parsedUser.Id;
        
        if (!userId) {
          showMessage({
            message: 'Không tìm thấy ID người dùng.',
            type: 'danger',
            icon: 'danger',
          });
          setStatus('failed');
          return;
        }
        
        console.log('User ID:', userId);
        setStatus('loading');
        
        const result = await dispatch(updateUserName({ userId, name: newName })).unwrap();
        
        console.log('Update result:', result);

        if (result) {
          parsedUser.Name = newName;
          await AsyncStorage.setItem('user', JSON.stringify(parsedUser));
          
          showMessage({
            message: 'Cập nhật tên người dùng thành công!',
            type: 'success',
            icon: 'success',
          });
          setStatus('succeeded');
          setError(null);
        }
      } else {
        showMessage({
          message: 'Không tìm thấy thông tin người dùng.',
          type: 'danger',
          icon: 'danger',
        });
        setStatus('failed');
        setError('No user data found');
      }
    } catch (err) {
      showMessage({
        message: err || 'Đã xảy ra lỗi khi cập nhật tên người dùng.',
        type: 'danger',
        icon: 'danger',
      });
      setStatus('failed');
      setError(err.message || 'Error occurred while updating the username');
      
    }
  };

  return {
    updateName,
    status,
    error,
  };
};

export default useUpdateUserName;
