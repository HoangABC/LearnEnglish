import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/authSlice';

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

  return {
    email,
    setEmail,
    password,
    setPassword,
    login: loginUser,
    error,
  };
};

export default useLogin;
