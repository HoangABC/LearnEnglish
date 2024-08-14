const twilio = require('twilio');

// Thay thế bằng thông tin của bạn
const accountSid = 'ACb0c9e7c3445a9ffd0f9f95794244b7ed';
const authToken = 'da43885f8fcc94de5d9b82412f211f44';
const client = new twilio(accountSid, authToken);

// Thay thế bằng số điện thoại gửi và nhận
const fromPhoneNumber = '+84332247226';
const toPhoneNumber = '+84588403469';

// Tạo mã OTP ngẫu nhiên
const otp = Math.floor(100000 + Math.random() * 900000);

async function sendOtp() {
  try {
    const message = await client.messages.create({
      body: `Mã OTP của bạn là: ${otp}`,
      from: fromPhoneNumber,
      to: toPhoneNumber
    });
    console.log('SMS gửi thành công với SID:', message.sid);
  } catch (error) {
    console.error('Lỗi:', error);
  }
}

// Gọi hàm sendOtp để gửi tin nhắn
module.exports = { sendOtp };
