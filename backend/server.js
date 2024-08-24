// src/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const http = require('http');
const os = require('os');
require('dotenv').config();
require('./src/config/passport');

const app = express();
const server = http.createServer(app);
const { setupSocket } = require('./src/Module/socket');
const createTablesIfNotExists = require('./src/scripts/createTable');
const { sendEmail } = require('./src/scripts/nodeMailer');
// const { parseTxtFile, syncWordsWithDatabase } = require('./src/scripts/tranlate');


createTablesIfNotExists();


// sendEmail();


const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const key of Object.keys(interfaces)) {
    for (const item of interfaces[key]) {
      if (item.family === 'IPv4' && !item.internal) {
        return item.address;
      }
    }
  }
  return '127.0.0.1'; 
};

const localIP = getLocalIP();
console.log('IP:', localIP);

// Cấu hình CORS và các middleware khác
app.use(cors({
  origin: [`http://localhost:3001`, `http://localhost:3000`, `http://localhost:3002`],
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

// Định tuyến
app.use('/auth', require('./src/routes/authRoutes'));
app.use('/api', require('./src/routes/wordRoutes'));
app.use('/account', require('./src/routes/userRoutes'));

// Cấu hình WebSocket
setupSocket(server);

// Đồng bộ dữ liệu từ file với cơ sở dữ liệu khi server khởi động
// const filePath = './src/data/atv.txt';
// const wordsDefinitions = parseTxtFile(filePath);
// syncWordsWithDatabase(wordsDefinitions)
//   .then(() => console.log('Database updated successfully.'))
//   .catch(err => console.error('Error updating database:', err));

// Khởi động server
server.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on http://${localIP}:${process.env.PORT || 3000}`);
});
