// src/services/emailService.js
const nodemailer = require('nodemailer');

// Tạo transporter với thông tin đăng nhập
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dohuyhoang1907@gmail.com',
    pass: 'appa fklv jfni eiix'  // Sử dụng mật khẩu ứng dụng nếu cần
  }
});

// Hàm gửi email
const sendEmail = () => {
  const mailOptions = {
    from: 'dohuyhoang1907@gmail.com',
    to: 'khongten190702@gmail.com',  // Nhập địa chỉ người nhận trực tiếp
    subject: 'Subject of your email',  // Nhập chủ đề email trực tiếp
    text: 'Body of your email'  // Nhập nội dung email trực tiếp
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info.response);
      }
    });
  });
};

module.exports = { sendEmail };
