import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, googleLogin } from '../redux/authSlice'; // Đảm bảo googleLogin được nhập từ authSlice

const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const error = useSelector((state) => state.auth.error);

  const loginUser = async () => {
    try {
      const resultAction = await dispatch(login({ email, password }));
      if (login.fulfilled.match(resultAction)) {
        const user = resultAction.payload;
        return { success: true, user };
      } else {
        return { success: false, user: null };
      }
    } catch (e) {
      console.error('Login failed:', e);
      return { success: false, user: null };
    }
  };

  const googleLoginUser = async (token) => {
    try {
      const resultAction = await dispatch(googleLogin(token));
      if (googleLogin.fulfilled.match(resultAction)) {
        const user = resultAction.payload;
        return { success: true, user };
      } else {
        return { success: false, user: null };
      }
    } catch (e) {
      console.error('Google login failed:', e);
      return { success: false, user: null };
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    login: loginUser,
    googleLogin: googleLoginUser, // Đảm bảo rằng googleLoginUser được trả về
    error,
  };
};

export default useLogin;
