import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../redux/authSlice';
import { showMessage } from 'react-native-flash-message';
import { unwrapResult } from '@reduxjs/toolkit';

const useRegister = (onSuccess) => {
  const dispatch = useDispatch();
  const { error, status } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);

      if (password !== confirmPassword) {
        showMessage({
          message: "Lỗi",
          description: 'Mật khẩu và xác nhận mật khẩu không khớp!',
          type: 'danger'
        });
        return;
      }

      const resultAction = await dispatch(register({
        name,
        username,
        email,
        password
      }));
      
      const response = unwrapResult(resultAction);

      // Hiển thị thông báo thành công từ backend
      showMessage({
        message: "Thành công",
        description: response.message,
        type: "success",
        duration: 4000,
      });
      
      // Reset form
      setName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      onSuccess?.();
      
    } catch (err) {
      // Phân biệt lỗi validation (400) và lỗi server (500)
      if (err.status === 400) {
        showMessage({
          message: "Thông tin không hợp lệ",
          description: err.message,
          type: "warning"
        });
      } else {
        showMessage({
          message: "Lỗi hệ thống",
          description: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
          type: "danger"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleRegister,
    error,
    loading: status === 'loading' || loading,
  };
};

export default useRegister;