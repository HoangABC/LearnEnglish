// hooks/useRegister.js
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../redux/authSlice';

const useRegister = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const error = useSelector((state) => state.auth.error);

  const registerUser = async () => {
    if (!name || !username || !email || !password) {
      return { success: false, user: null, message: 'Tất cả các trường đều yêu cầu' };
    }
    setLoading(true);
    try {
      const resultAction = await dispatch(register({ name, username, email, password }));
      if (register.fulfilled.match(resultAction)) {
        const user = resultAction.payload;
        return { success: true, user };
      } else {
        return { success: false, user: null, message: resultAction.payload };
      }
    } catch (e) {
      console.error('Đăng ký không thành công:', e);
      return { success: false, user: null, message: e.message };
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
    loading,
    register: registerUser,
    error,
  };
};

export default useRegister;
