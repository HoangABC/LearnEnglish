import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, googleLogin } from '../redux/authSlice';

const useLogin = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const error = useSelector((state) => state.auth.error);

  const loginUser = async () => {
    if (!emailOrUsername || !password) {
      return { success: false, user: null, message: 'Email hoặc username và mật khẩu là bắt buộc' };
    }
    try {
      const resultAction = await dispatch(login({ emailOrUsername, password }));
      if (login.fulfilled.match(resultAction)) {
        const user = resultAction.payload;
        return { success: true, user };
      } else {
        return { success: false, user: null, message: resultAction.payload };
      }
    } catch (e) {
      console.error('Đăng nhập thất bại:', e);
      return { success: false, user: null, message: e.message };
    }
  };

  const googleLoginUser = async (idToken) => {
    try {
      console.log("Thực hiện đăng nhập Google với token:", idToken);
      const resultAction = await dispatch(googleLogin(idToken));
      if (googleLogin.fulfilled.match(resultAction)) {
        const user = resultAction.payload;
        console.log("Đăng nhập Google thành công:", user);
        return { success: true, user };
      } else {
        console.error('Lỗi đăng nhập Google:', resultAction.payload);
        return { success: false, user: null, message: resultAction.payload };
      }
    } catch (e) {
      console.error('Đăng nhập Google thất bại:', e);
      return { success: false, user: null, message: e.message };
    }
  };
  
  return {
    emailOrUsername,
    setEmailOrUsername,
    password,
    setPassword,
    login: loginUser,
    googleLogin: googleLoginUser,
    error,
  };
};

export default useLogin;
