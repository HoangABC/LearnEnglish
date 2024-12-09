// socket.js
const socketIo = require('socket.io');

let io;

const setupSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: [
        'http://localhost:3001',
        'http://localhost:3000',
        'http://localhost:3002',
        'http://192.168.1.100:3000',
        'http://192.168.1.100:3001',
        'http://192.168.1.100:3002',
        'http://26.169.114.72:3000'
      ],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    // Lắng nghe khi user gửi feedback mới
    socket.on('user_submit_feedback', async (feedback) => {
      console.log('New feedback from user:', feedback);
      // Broadcast để admin nhận được feedback mới ngay lập tức
      io.emit('refresh_feedbacks');
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Thêm hàm tiện ích để emit events từ bất kỳ đâu trong ứng dụng
const emitFeedbackUpdate = (feedback) => {
  if (io) {
    io.emit('new_feedback', feedback);
  }
};

const emitFeedbackResponse = (updatedFeedback) => {
  if (io) {
    io.emit('feedback_updated', updatedFeedback);
  }
};

module.exports = { 
  setupSocket, 
  getIo,
  emitFeedbackUpdate,
  emitFeedbackResponse 
};
