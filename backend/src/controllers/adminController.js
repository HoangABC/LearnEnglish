require('dotenv').config(); 
const bcrypt = require('bcrypt');
const { poolPromise, sql } = require('../config/db');
const nodemailer = require('nodemailer');
const { emitFeedbackResponse } = require('../Module/socket');

const saltRounds = 10;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const login = async (req, res) => {
    const { emailOrUsername, password } = req.body;
    console.log('Email/Username:', emailOrUsername); 
    console.log('Password:', password);
  
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Email/Username và mật khẩu là bắt buộc' });
    }
  
    try {

      const pool = await poolPromise;
      console.log('Connected to the database');

      const query = 'SELECT * FROM [Admin] WHERE Email = @EmailOrUsername OR Username = @EmailOrUsername';
      const result = await pool.request()
        .input('EmailOrUsername', sql.VarChar, emailOrUsername)
        .query(query);
  
      console.log('Database query result:', result.recordset); 
  
      if (result.recordset.length > 0) {
        const admin = result.recordset[0];
        console.log('Admin found:', admin);

        if (admin.Status === 0) {
          return res.status(401).json({ message: 'Email chưa được xác nhận. Vui lòng kiểm tra email của bạn.' });
        }

        if (password === admin.Password) {
          req.session.user = admin;
          res.status(200).json({ 
            message: 'Admin đã đăng nhập thành công!', 
            user: { 
              Id: admin.Id, 
              name: admin.Name, 
              email: admin.Email,
              Role: admin.Role
            } 
          });
        } else {
          res.status(401).json({ message: 'Mật khẩu không chính xác.' });
        }
      } else {
        res.status(401).json({ message: 'Thông tin đăng nhập không chính xác' });
      }
    } catch (err) {
      console.log('Error in login:', err);
      res.status(500).send({ message: 'Lỗi máy chủ. Vui lòng thử lại sau.' });
    }
  };
  

const logout = (req, res) => {
  if (req.session && req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Không thể đăng xuất, vui lòng thử lại!' });
      }

      res.status(200).json({ message: 'Đăng xuất thành công!' });
    });
  } else {
    res.status(400).json({ message: 'Không có người dùng nào đang đăng nhập' });
  }
};

const getAllFeedbacks = async (req, res) => {
  try {
      const pool = await poolPromise;
      const result = await pool.request()
          .query(`
              SELECT 
                  f.Id,
                  f.UserId,
                  u.Name as UserName,
                  f.FeedbackText,
                  f.CreatedAt,
                  f.Status,
                  ar.ResponseText as AdminResponse,
                  a.Name as AdminName,
                  ar.CreatedAt as ResponseDate
              FROM UserFeedback f
              LEFT JOIN [User] u ON f.UserId = u.Id
              LEFT JOIN AdminResponse ar ON f.Id = ar.FeedbackId
              LEFT JOIN [Admin] a ON ar.AdminId = a.Id
              ORDER BY f.CreatedAt DESC
          `);
      
      const feedbacks = result.recordset;

      req.app.get('io').emit('feedbacks_updated', feedbacks);
      
      res.status(200).json({
          success: true,
          data: feedbacks
      });
  } catch (error) {
      console.error('Error getting feedbacks:', error);
      res.status(500).json({
          success: false,
          message: 'Lỗi máy chủ',
          error: error.message
      });
  }
};

const getFeedbackById = async (req, res) => {
  try {
      const { id } = req.params;
      const pool = await poolPromise;
      const result = await pool.request()
          .input('id', id)
          .query(`
              SELECT 
                  f.Id,
                  f.UserId,
                  u.Name as UserName,
                  f.FeedbackText,
                  f.CreatedAt,
                  f.Status,
                  ar.ResponseText as AdminResponse,
                  admin.Name as AdminName,
                  ar.CreatedAt as ResponseDate
              FROM UserFeedback f
              LEFT JOIN [User] u ON f.UserId = u.Id
              LEFT JOIN AdminResponse ar ON f.Id = ar.FeedbackId
              LEFT JOIN [User] admin ON ar.AdminId = admin.Id
              WHERE f.Id = @id
          `);

      if (result.recordset.length === 0) {
          return res.status(404).json({
              success: false,
              message: 'Không tìm thấy phản hồi'
          });
      }

      res.status(200).json({
          success: true,
          data: result.recordset[0]
      });
  } catch (error) {
      console.error('Error getting feedback:', error);
      res.status(500).json({
          success: false,
          message: 'Lỗi máy chủ',
          error: error.message
      });
  }
};

const getFeedbacksByUserId = async (req, res) => {
  try {
      const { userId } = req.params;
      const pool = await poolPromise;
      const result = await pool.request()
          .input('userId', userId)
          .query(`
              SELECT 
                  f.Id,
                  f.UserId,
                  u.Name as UserName,
                  f.FeedbackText,
                  f.CreatedAt,
                  f.Status,
                  ar.ResponseText as AdminResponse,
                  admin.Name as AdminName,
                  ar.CreatedAt as ResponseDate
              FROM UserFeedback f
              LEFT JOIN [User] u ON f.UserId = u.Id
              LEFT JOIN AdminResponse ar ON f.Id = ar.FeedbackId
              LEFT JOIN [User] admin ON ar.AdminId = admin.Id
              WHERE f.UserId = @userId
              ORDER BY f.CreatedAt DESC
          `);

      res.status(200).json({
          success: true,
          data: result.recordset
      });
  } catch (error) {
      console.error('Error getting user feedbacks:', error);
      res.status(500).json({
          success: false,
          message: 'Lỗi máy chủ',
          error: error.message
      });
  }
};

const respondToFeedback = async (req, res) => {
    try {
        console.log('Request body received:', req.body);
        
        const { feedbackId: { feedbackId, responseText, adminId } } = req.body;
        
        console.log('Extracted values:', {
            feedbackId,
            responseText,
            adminId
        });
      
        if (!feedbackId || !responseText || !adminId) {
            return res.status(400).json({
                success: false,
                message: 'ID phản hồi, nội dung trả lời và ID admin là bắt buộc',
                receivedData: { feedbackId, responseText, adminId }
            });
        }

        const pool = await poolPromise;
        
        const feedbackCheck = await pool.request()
            .input('feedbackId', sql.Int, feedbackId)
            .query('SELECT * FROM UserFeedback WHERE Id = @feedbackId');

        if (feedbackCheck.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phản hồi'
            });
        }

        await pool.request()
            .input('feedbackId', sql.Int, feedbackId)
            .input('adminId', sql.Int, adminId)
            .input('responseText', sql.NVarChar, responseText)
            .query(`
                INSERT INTO AdminResponse (FeedbackId, AdminId, ResponseText)
                VALUES (@feedbackId, @adminId, @responseText)
            `);

        await pool.request()
            .input('feedbackId', sql.Int, feedbackId)
            .query(`
                UPDATE UserFeedback
                SET Status = 2
                WHERE Id = @feedbackId
            `);

        const updatedFeedback = {
            Id: feedbackId,
            AdminResponse: responseText,
            Status: 2,
            ResponseDate: new Date().toISOString()
        };
        
        emitFeedbackResponse(updatedFeedback);

        res.status(200).json({
            success: true,
            message: 'Phản hồi đã được gửi thành công'
        });
    } catch (error) {
        console.error('Error in respondToFeedback:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: error.message,
            requestBody: req.body
        });
    }
};

module.exports = {
  login,
  logout,
  getAllFeedbacks,
  getFeedbackById,
  getFeedbacksByUserId,
  respondToFeedback
};
