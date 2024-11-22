const { poolPromise } = require('../config/db');

// Gửi feedback từ user
const createFeedback = async (req, res) => {
  const { userId, feedbackText } = req.body;
  
  try {
    const pool = await poolPromise;
    const request = pool.request();

    const result = await request.query(`
      INSERT INTO UserFeedback (UserId, FeedbackText)
      VALUES (${userId}, N'${feedbackText}');
    `);

    res.status(201).json({ 
      success: true, 
      message: 'Feedback đã được gửi thành công' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi gửi feedback', 
      error: error.message 
    });
  }
};

const getUserFeedbacks = async (req, res) => {
    let { userId } = req.query;  // or req.params if using URL params
  
    // Ensure the userId is a valid integer and trim any extra spaces or newline characters
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
  
      // Ensure userId is an integer before passing to the query
      request.input('userId', parseInt(userId));
  
      const feedbacks = await request.query(`
        SELECT 
          UF.Id as FeedbackId,
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