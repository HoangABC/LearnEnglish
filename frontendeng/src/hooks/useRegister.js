import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../redux/authSlice';
import { showMessage } from 'react-native-flash-message';
import { unwrapResult } from '@reduxjs/toolkit';

const useRegister = (onRegisterSuccess) => {
  const dispatch = useDispatch();
  const { error, status, successMessage } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      showMessage({ message: 'Mật khẩu và xác nhận mật khẩu không khớp!', type: 'danger' });
      return;
    }

    try {
      const resultAction = await dispatch(register({ name, username, email, password }));
      const result = unwrapResult(resultAction);
      if (result.user) {
        showMessage({ message: successMessage || 'Đăng ký thành công!', type: 'success' });
        if (onRegisterSuccess) onRegisterSuccess();
      } else {
        showMessage({ message: error || '', type: 'danger' });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra';
      showMessage({ message: errorMessage, type: 'danger' });
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
    loading: status === 'loading',
  };
};

export default useRegister;
