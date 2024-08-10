import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <h1>Navbar</h1>
      <ul>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/word-management">Word Management</Link>
        </li>
        {/* Thêm các liên kết khác nếu cần */}
      </ul>
    </nav>
  );
};

export default Navbar;
