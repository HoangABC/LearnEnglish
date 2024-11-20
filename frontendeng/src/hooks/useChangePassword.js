import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { changePassword } from '../redux/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message'; 

export const useChangePassword = () => {
  const dispatch = useDispatch();
  const { status, error, successMessage } = useSelector(state => state.auth);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          const userId = parsedUser.Id;

          if (!userId) {
            showMessage({
              message: 'User ID not found',
              type: 'danger',
              icon: 'danger',
            });
            return;
          }
          setUserId(userId); 
        } else {
          showMessage({
            message: 'No user data found',
            type: 'danger',
            icon: 'danger',
          });
        }
      } catch (err) {
        showMessage({
          message: 'Error retrieving user data',
          type: 'danger',
          icon: 'danger',
        });
      }
    };

    fetchUserId();
  }, []); 

  const handleChangePassword = async (currentPassword, newPassword) => {
    if (!userId) {
      showMessage({
        message: 'Không tìm thấy ID người dùng.',
        type: 'danger',
        icon: 'danger',
      });
      return false;
    }
  
    try {
      const message = await dispatch(changePassword({ userId, currentPassword, newPassword })).unwrap();
      
      showMessage({
        message: message || 'Đã thay đổi mật khẩu thành công', 
        type: 'success',
        icon: 'success',
      });
      return true;
    } catch (err) {
      const errorMessage = err || 'Đã xảy ra lỗi khi cập nhật mật khẩu.';
      
      if (errorMessage.includes('Mật khẩu cũ không chính xác')) {
        showMessage({
          message: 'Mật khẩu cũ không chính xác',
          type: 'danger',
          icon: 'danger',
        });
      } else {
        showMessage({
          message: errorMessage, 
          type: 'danger',
          icon: 'danger',
        });
      }
      return false;
    }
  };
  
  return {
    status, 
    error, 
    successMessage,
    handleChangePassword,
  };
};
