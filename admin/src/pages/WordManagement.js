import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWordsStatus1, fetchWordsStatus0, updateWordStatus } from '../redux/wordSlice';
import io from 'socket.io-client';

const socket = io('http://192.168.1.8:3000');

const PAGE_SIZE = 20; // Số lượng từ mỗi trang

function WordManagement() {
  const dispatch = useDispatch();
  const { status1, status0, loading, error } = useSelector((state) => state.words);
  const [currentPage1, setCurrentPage1] = useState(1);
  const [currentPage0, setCurrentPage0] = useState(1);

  useEffect(() => {
    dispatch(fetchWordsStatus1({ page: currentPage1, pageSize: PAGE_SIZE }));
    dispatch(fetchWordsStatus0({ page: currentPage0, pageSize: PAGE_SIZE }));

    // Lắng nghe sự kiện từ server
    socket.on('dataUpdated', () => {
      console.log('Data updated received from server');
      dispatch(fetchWordsStatus1({ page: currentPage1, pageSize: PAGE_SIZE }));
      dispatch(fetchWordsStatus0({ page: currentPage0, pageSize: PAGE_SIZE }));
    });

    // Dọn dẹp khi component unmount
    return () => {
      socket.off('dataUpdated');
    };
  }, [dispatch, currentPage1, currentPage0]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await dispatch(updateWordStatus({ id, newStatus }));
      // Gọi lại để lấy dữ liệu mới từ backend
      dispatch(fetchWordsStatus1());
      dispatch(fetchWordsStatus0());
    } catch (err) {
      console.error('Error updating word status:', err.message);
    }
  };
  

  const handlePageChange = (page, statusType) => {
    if (statusType === 1) {
      setCurrentPage1(page);
      dispatch(fetchWordsStatus1({ page, pageSize: PAGE_SIZE }));
    } else if (statusType === 0) {
      setCurrentPage0(page);
      dispatch(fetchWordsStatus0({ page, pageSize: PAGE_SIZE }));
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Word Management</h1>

      {error && <p>Error: {error}</p>}

      <h2>Words with Status 1</h2>
      <table>
        <thead>
          <tr>
            <th>Word</th>
            <th>Definition</th>
            <th>Phonetic UK</th>
            <th>Phonetic US</th>
            <th>Example</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {status1.map(word => (
            <tr key={word.Id}>
              <td>{word.Word}</td>
              <td>{word.Definition}</td>
              <td>{word.PhoneticUK}</td>
              <td>{word.PhoneticUS}</td>
              <td>{word.Examples}</td>
              <td>
                <button onClick={() => handleStatusChange(word.Id, 0)}>Set to Status 0</button>
                <button onClick={() => handleStatusChange(word.Id, 3)}>Set to Status 3</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => handlePageChange(currentPage1 - 1, 1)} disabled={currentPage1 <= 1}>Previous</button>
      <button onClick={() => handlePageChange(currentPage1 + 1, 1)}>Next</button>

      <h2>Words with Status 0</h2>
      <table>
        <thead>
          <tr>
            <th>Word</th>
            <th>Definition</th>
            <th>Phonetic UK</th>
            <th>Phonetic US</th>
            <th>Example</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {status0.map(word => (
            <tr key={word.Id}>
              <td>{word.Word}</td>
              <td>{word.Definition}</td>
              <td>{word.PhoneticUK}</td>
              <td>{word.PhoneticUS}</td>
              <td>{word.Examples}</td>
              <td>
                <button onClick={() => handleStatusChange(word.Id, 1)}>Set to Status 1</button>
                <button onClick={() => handleStatusChange(word.Id, 3)}>Set to Status 3</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => handlePageChange(currentPage0 - 1, 0)} disabled={currentPage0 <= 1}>Previous</button>
      <button onClick={() => handlePageChange(currentPage0 + 1, 0)}>Next</button>
    </div>
  );
}

export default WordManagement;