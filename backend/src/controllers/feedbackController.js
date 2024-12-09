const { poolPromise } = require('../config/db');
const sql = require('mssql');
const { emitFeedbackUpdate } = require('../Module/socket');

// Gửi feedback từ user
const createFeedback = async (req, res) => {
  const { userId, feedbackText } = req.body;
  
  try {
    const pool = await poolPromise;
    const request = pool.request();

    // Sử dụng tham số để tránh SQL injection
    request
      .input('userId', sql.Int, userId)
      .input('feedbackText', sql.NVarChar, feedbackText);

    const result = await request.query(`
      INSERT INTO UserFeedback (UserId, FeedbackText, Status, CreatedAt)
      VALUES (@userId, @feedbackText, 1, GETDATE());
      
      SELECT 
        UF.Id as FeedbackId,
        UF.UserId,
        U.Name as UserName,
        UF.FeedbackText,
        UF.CreatedAt as FeedbackCreatedAt,
        UF.Status as FeedbackStatus
      FROM UserFeedback UF
      JOIN [User] U ON UF.UserId = U.Id
      WHERE UF.Id = SCOPE_IDENTITY();
    `);

    const newFeedback = result.recordset[0];

    // Emit socket event để refresh danh sách feedback
    const io = req.app.get('io');
    if (io) {
      io.emit('refresh_feedbacks');
      console.log('Emitted refresh_feedbacks signal');
    }

    res.status(201).json({ 
      success: true, 
      message: 'Feedback đã được gửi thành công',
      data: newFeedback
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi gửi feedback', 
      error: error.message 
    });
  }
};

const getUserFeedbacks = async (req, res) => {
    let { userId } = req.query;
  
    userId = userId ? userId.trim() : null;
  
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "UserId is required and must be a valid number"
      });
    }
  
    try {
      const pool = await poolPromise;
      const request = pool.request();
  
      request.input('userId', parseInt(userId));
  
      const feedbacks = await request.query(`
        SELECT 
          UF.Id as FeedbackId,
          UF.UserId,
          UF.FeedbackText,
          UF.CreatedAt as FeedbackCreatedAt,
          UF.Status as FeedbackStatus,
          AR.ResponseText as AdminResponse,
          AR.CreatedAt as ResponseCreatedAt,
          A.Name as AdminName
        FROM UserFeedback UF
        LEFT JOIN AdminResponse AR ON UF.Id = AR.FeedbackId
        LEFT JOIN Admin A ON AR.AdminId = A.Id
        WHERE UF.UserId = @userId
        ORDER BY UF.CreatedAt DESC
      `);
  
      res.status(200).json({
        success: true,
        data: feedbacks.recordset
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách feedback',
        error: error.message
      });
    }
  };
  

module.exports = {
  createFeedback,
  getUserFeedbacks
}; 