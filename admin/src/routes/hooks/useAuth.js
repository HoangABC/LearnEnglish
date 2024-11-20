import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../../redux/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated: isAuthenticatedFromStore, status } = useSelector((state) => state.auth);

  const handleLogin = async (emailOrUsername, password) => {
    try {
      const resultAction = await dispatch(login({ emailOrUsername, password }));
      
      if (login.fulfilled.match(resultAction)) {
        sessionStorage.setItem('user', JSON.stringify(resultAction.payload.user));
      } else {
        console.error('Login failed:', resultAction.error);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user'); 
    dispatch(logout());
  };

  const isAuthenticated = isAuthenticatedFromStore && !!sessionStorage.getItem('user');

  return {
    handleLogin,
    handleLogout,
    isAuthenticated,
    loading: status === 'loading',
  };
};

export default useAuth;
