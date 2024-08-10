import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux'; // Import Provider
import store from './redux/store'; // Đảm bảo đường dẫn là chính xác
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import WordManagement from './pages/WordManagement';
// import Reports from './pages/Reports';

function App() {
  return (
    <Provider store={store}> {/* Bọc ứng dụng với Provider */}
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/word-management" element={<WordManagement />} />
            {/* <Route path="/reports" element={<Reports />} /> */}
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
