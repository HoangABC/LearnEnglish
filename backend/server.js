// // src/server.js
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const session = require('express-session');
// const passport = require('passport');
// const http = require('http');
// const os = require('os');
// require('dotenv').config();
// require('./src/config/passport');

// const app = express();
// const server = http.createServer(app);
// const { setupSocket } = require('./src/Module/socket');
// const createTablesIfNotExists = require('./src/scripts/createTable');
// const { sendEmail } = require('./src/scripts/nodeMailer');
// // const { parseTxtFile, syncWordsWithDatabase } = require('./src/scripts/tranlate');
// // const { extractSentencesAndInsert } = require('./src/scripts/extractSentences');
// // const importCSVtoDatabase = require('./src/scripts/csv'); // Điều chỉnh đường dẫn nếu cần

// createTablesIfNotExists();

// // Đường dẫn file CSV mà bạn muốn import (đã bị comment để tránh thực thi)
// const inputFilePath = './src/data/advance_exvi.csv';

// // Gọi hàm importCSVtoDatabase để import dữ liệu (tùy chọn, có thể bật lại khi cần)
// // importCSVtoDatabase(inputFilePath)
// //   .then(() => {
// //     console.log('Dữ liệu đã được import thành công!');
// //   })
// //   .catch(err => {
// //     console.error('Lỗi khi import dữ liệu:', err);
// //   });

// // Hàm lấy địa chỉ IP cục bộ của máy
// const getLocalIP = () => {
//   const interfaces = os.networkInterfaces();
//   for (const key of Object.keys(interfaces)) {
//     for (const item of interfaces[key]) {
//       if (item.family === 'IPv4' && !item.internal) {
//         return item.address; // Trả về địa chỉ IP của mạng
//       }
//     }
//   }
//   return '127.0.0.1'; // Trả về localhost nếu không tìm thấy IP
// };

// const localIP = getLocalIP();
// console.log('IP:', localIP);

// // Cấu hình CORS và các middleware khác
// app.use(cors({
//   origin: [
//     `http://localhost:3001`,
//     `http://localhost:3000`,
//     `http://localhost:3002`,
//     `http://${localIP}:3000`,  // Cho phép truy cập từ IP nội bộ với cổng 3000
//     `http://${localIP}:3001`,  // Cho phép truy cập từ IP nội bộ với cổng 3001
//     `http://${localIP}:3002`   // Cho phép truy cập từ IP nội bộ với cổng 3002
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
// }));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'default_secret',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false },
// }));
// app.use(passport.initialize());
// app.use(passport.session());

// // Định tuyến
// app.use('/auth', require('./src/routes/authRoutes'));
// app.use('/api', require('./src/routes/wordRoutes'));
// app.use('/account', require('./src/routes/userRoutes'));
// app.use('/test', require('./src/routes/testRoutes'));
// app.use('/games', require('./src/routes/gameRoutes'));
// app.use('/listen', require('./src/routes/listenRoutes'));

// // Cấu hình WebSocket
// setupSocket(server);

// // Đồng bộ dữ liệu từ file với cơ sở dữ liệu khi server khởi động (bị comment để tránh thực thi không mong muốn)
// // const filePath = './src/data/atv.txt';
// // const wordsDefinitions = parseTxtFile(filePath);
// // syncWordsWithDatabase(wordsDefinitions)
// //   .then(() => console.log('Database updated successfully.'))
// //   .catch(err => console.error('Error updating database:', err));

// // Khởi động server
// const PORT = process.env.PORT || 3000;  // Cổng được lấy từ biến môi trường hoặc mặc định là 3000
// server.listen(PORT, () => {
//   console.log(`Server is running on http://${localIP}:${PORT}`);
// });


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const http = require('http');
const path = require('path');
const fileUpload = require('express-fileupload');
const socketIO = require('socket.io');
require('dotenv').config();
require('./src/config/passport');

const app = express();
const server = http.createServer(app);
const { setupSocket } = require('./src/Module/socket');
const createTablesIfNotExists = require('./src/scripts/createTable');
const { sendEmail } = require('./src/scripts/nodeMailer');

app.set('view engine', 'ejs');
app.set('views', './src/views');

createTablesIfNotExists();

const localIP = '192.168.1.100';
console.log('IP:', localIP);

app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 10 * 1024 * 1024 
  }
}));

app.use(cors({
  origin: [
    `http://localhost:3001`,
    `http://localhost:3000`,
    `http://localhost:3002`,
    `http://${localIP}:3000`,  
    `http://${localIP}:3001`,  
    `http://${localIP}:3002`,
    'http://26.169.114.72:3000'   
  ],
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
app.use(passport.initialize());
app.use(passport.session());

// Define routes
app.use('/games', require('./src/routes/gameRoutes')); 
app.use('/ad', require('./src/routes/adminRoutes'));
app.use('/auth', require('./src/routes/authRoutes'));
app.use('/api', require('./src/routes/wordRoutes'));
app.use('/account', require('./src/routes/userRoutes'));
app.use('/test', require('./src/routes/testRoutes'));
app.use('/listen', require('./src/routes/listenRoutes'));
app.use('/statistics', require('./src/routes/statisticsRoutes'));
app.use('/feedback', require('./src/routes/feedbackRoutes'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src/public', express.static(path.join(__dirname, 'src/public')));

// Add new route for audio test page
app.get('/audio-test', (req, res) => {
    res.render('audio-test');
});

// Khởi tạo socket.io và lưu vào app
const io = setupSocket(server);
app.set('io', io);

// Start server
const PORT = process.env.PORT || 3000; 
server.listen(PORT, () => {
  console.log(`Server is running on http://${localIP}:${PORT}`);
});
