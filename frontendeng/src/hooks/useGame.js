import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWordGuess,
  submitWordGuess,
  resetError,
  setDataLoaded,
} from '../redux/gameSlice';

const useGame = () => {
  const dispatch = useDispatch();
  const {
    wordForGuess,
    error,
    status,
    dataLoaded,
  } = useSelector((state) => state.games);

  const fetchWordGuessHandler = (userId) => {
    dispatch(fetchWordGuess(userId));
  };

  const submitWordGuessHandler = (userId, wordId, answer) => {
    return dispatch(submitWordGuess({ userId, wordId, answer })); // Trả về promise
  };

  const resetErrorHandler = () => {
    dispatch(resetError());
  };

  const setDataLoadedHandler = (loaded) => {
    dispatch(setDataLoaded(loaded));
  };

  return {
    wordForGuess,
    error,
    status,
    dataLoaded,
    fetchWordGuess: fetchWordGuessHandler,
    submitWordGuess: submitWordGuessHandler,
    resetError: resetErrorHandler,
    setDataLoaded: setDataLoadedHandler,
  };
};

export default useGame;