import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, googleLogin } from '../redux/authSlice';

const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const error = useSelector((state) => state.auth.error);

  const loginUser = async () => {
    if (!email || !password) {
      return { success: false, user: null, message: 'Email and password are required' };
    }
    try {
      const resultAction = await dispatch(login({ email, password }));
      if (login.fulfilled.match(resultAction)) {
        const user = resultAction.payload;
        return { success: true, user };
      } else {
        return { success: false, user: null, message: resultAction.payload };
      }
    } catch (e) {
      console.error('Login failed:', e);
      return { success: false, user: null, message: e.message };
    }
  };

  const googleLoginUser = async (idToken) => {
    try {
      console.log("Attempting Google login with token:", idToken);
      const resultAction = await dispatch(googleLogin(idToken));
      if (googleLogin.fulfilled.match(resultAction)) {
        const user = resultAction.payload;
        console.log("Google login successful:", user);
        return { success: true, user };
      } else {
        console.error('Google login error:', resultAction.payload);
        return { success: false, user: null, message: resultAction.payload };
      }
    } catch (e) {
      console.error('Google login failed:', e);
      return { success: false, user: null, message: e.message };
    }
  };
  
  

  return {
    email,
    setEmail,
    password,
    setPassword,
    login: loginUser,
    googleLogin: googleLoginUser,
    error,
  };
};


export default useLogin;
