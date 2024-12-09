const express = require('express');
const router = express.Router();
const { poolPromise } = require('../config/db'); 


router.get('/customers', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM KHACHHANG');
    res.json(result.recordset);
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu khách hàng:', error);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu khách hàng.' });
  }
});

module.exports = router;
