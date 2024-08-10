// socket.js
const socketIo = require('socket.io');

let io;

const setupSocket = (server) => {
  io = socketIo(server);
  io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};

const getIo = () => io;

module.exports = { setupSocket, getIo };
