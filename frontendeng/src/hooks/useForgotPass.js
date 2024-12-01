import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestPasswordReset, verifyResetToken, resetPassword } from '../redux/authSlice';

const useForgotPass = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const dispatch = useDispatch();
  const { status, error, successMessage } = useSelector((state) => state.auth);

  const handleForgotPassword = async (emailInput) => {
    if (!emailInput) {
      return { success: false, message: 'Email là bắt buộc' };
    }

    try {
      const resultAction = await dispatch(requestPasswordReset(emailInput));
      if (requestPasswordReset.fulfilled.match(resultAction)) {
        return { 
          success: true, 
          message: resultAction.payload.message 
        };
      } else {
        return { 
          success: false, 
          message: resultAction.payload 
        };
      }
    } catch (e) {
      console.error('Lỗi khi yêu cầu đặt lại mật khẩu:', e);
      return { 
        success: false, 
        message: e.message 
      };
    }
  };

  const handleVerifyToken = async (emailInput, tokenInput) => {
    if (!emailInput || !tokenInput) {
      return { success: false, message: 'Email và mã xác nhận là bắt buộc' };
    }

    try {
      const resultAction = await dispatch(verifyResetToken({ email: emailInput, token: tokenInput }));
      if (verifyResetToken.fulfilled.match(resultAction)) {
        return {
          success: true,
          message: resultAction.payload.message
        };
      } else {
        return {
          success: false,
          message: resultAction.payload
        };
      }
    } catch (e) {
      console.error('Lỗi khi xác thực mã:', e);
      return {
        success: false,
        message: e.message
      };
    }
  };

  const handleResetPassword = async (emailInput, newPassword) => {
    if (!emailInput || !newPassword) {
      return { success: false, message: 'Email và mật khẩu mới là bắt buộc' };
    }

    try {
      const resultAction = await dispatch(resetPassword({ email: emailInput, newPassword }));
      if (resetPassword.fulfilled.match(resultAction)) {
        return {
          success: true,
          message: resultAction.payload.message
        };
      } else {
        return {
          success: false,
          message: resultAction.payload
        };
      }
    } catch (e) {
      console.error('Lỗi khi đặt lại mật khẩu:', e);
      return {
        success: false,
        message: e.message
      };
    }
  };

  return {
    email,
    setEmail,
    token,
    setToken,
    handleForgotPassword,
    handleVerifyToken,
    handleResetPassword,
    status,
    error,
    successMessage
  };
};

export default useForgotPass; 