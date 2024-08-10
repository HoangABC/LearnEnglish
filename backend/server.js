const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const http = require('http');
const os = require('os');
require('dotenv').config();
require('../backend/src/config/passport');
const importCSVtoDatabase = require('./src/scripts/csv'); // Đảm bảo đường dẫn chính xác

const app = express();
const server = http.createServer(app);
const { setupSocket } = require('./src/Module/socket');
const createTablesIfNotExists = require('./src/scripts/createTable');

// Hàm lấy địa chỉ IP cục bộ
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const key of Object.keys(interfaces)) {
    for (const item of interfaces[key]) {
      if (item.family === 'IPv4' && !item.internal) {
        return item.address;
      }
    }
  }
  return '127.0.0.1'; // Trả về địa chỉ IP mặc định nếu không tìm thấy địa chỉ IP cục bộ
};

const localIP = getLocalIP();

// Gọi hàm tạo bảng
// createTablesIfNotExists();

// Cấu hình CORS và các middleware khác
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// app.use('/auth', require('./src/routes/authRoutes')); // Đã cập nhật đúng đường dẫn
app.use('/api', require('./src/routes/wordRoutes'));
app.use('/account', require('./src/routes/userRoutes'));

// Cấu hình WebSocket
setupSocket(server);

// Gọi hàm import CSV
// const csvFilePath = './src/data/advance.csv'; 
// importCSVtoDatabase(csvFilePath).catch(err => {
//   console.error('Error importing CSV:', err);
// });

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on http://${localIP}:${process.env.PORT || 3000}`);
});
