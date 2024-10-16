import { useDispatch, useSelector } from 'react-redux';
import { fetchTests, submitQuiz, resetQuiz, setNewLevelId } from '../redux/testSlice';

const useTest = () => {
  const dispatch = useDispatch();

  // Lấy dữ liệu từ Redux store
  const { tests, score, totalQuestions, newLevelId, loading, error } = useSelector((state) => state.tests);

  // Hàm để lấy danh sách bài kiểm tra
  const fetchUserTests = (userId) => {
    dispatch(fetchTests(userId));
  };

  // Hàm để nộp bài kiểm tra
  const submitUserQuiz = (userId, answers) => {
    dispatch(submitQuiz({ userId, answers }));
  };

  // Hàm để cập nhật newLevelId
  const updateNewLevelId = (levelId) => {
    dispatch(setNewLevelId(levelId));
  };

  // Hàm để reset bài kiểm tra
  const resetUserQuiz = () => {
    dispatch(resetQuiz());
  };

  // Trả về các giá trị và hàm cần thiết để sử dụng trong component
  return {
    tests,
    score,
    totalQuestions,
    newLevelId, // Thêm newLevelId vào đây
    loading,
    error,
    fetchUserTests,
    submitUserQuiz,
    updateNewLevelId, // Thêm hàm cập nhật newLevelId
    resetUserQuiz,
  };
};

export default useTest;
