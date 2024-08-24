import { useDispatch, useSelector } from 'react-redux';
import { searchWord, resetError, resetSearchResults } from '../redux/wordSlice';

const useWordActions = () => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.words.status);
  const error = useSelector((state) => state.words.error);
  const searchResults = useSelector((state) => state.words.searchResults);

  const handleSearchWord = async (keyword) => {
    await dispatch(searchWord(keyword));
  };

  const clearError = () => {
    dispatch(resetError());
  };

  const clearSearchResults = () => {
    dispatch(resetSearchResults());
  };

  return {
    status,
    error,
    searchResults,
    handleSearchWord,
    clearError,
    clearSearchResults,
  };
};

export default useWordActions;
