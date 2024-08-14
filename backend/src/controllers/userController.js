require('dotenv').config();
const bcrypt = require('bcrypt');
const { poolPromise, sql } = require('../config/db');
const nodemailer = require('nodemailer');

const saltRounds = 10;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const register = async (req, res) => {
  const { name, username, email, password } = req.body;
  
  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: 'Name, username, email, and password are required' });
  }

  try {
    const pool = await poolPromise;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const existingUser = await pool.request()
      .input('Email', sql.VarChar, email)
      .input('Username', sql.VarChar, username)
      .query('SELECT * FROM [User] WHERE Email = @Email OR Username = @Username');

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    await pool.request()
      .input('GoogleId', sql.NVarChar, null)
      .input('Name', sql.NVarChar, name)
      .input('Username', sql.VarChar, username)
      .input('Email', sql.VarChar, email)
      .input('Password', sql.NVarChar, hashedPassword)
      .input('ConfirmationToken', sql.NVarChar, null)
      .input('Status', sql.Int, 1)
      .query('INSERT INTO [User] (GoogleId, Name, Username, Email, Password, ConfirmationToken, Status) VALUES (@GoogleId, @Name, @Username, @Email, @Password, @ConfirmationToken, @Status)');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Cảm ơn bạn đã đăng ký!',
      text: 'Cảm ơn bạn đã đăng ký tài khoản với chúng tôi. Bạn có thể đăng nhập ngay lập tức!'
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: 'User registered successfully!',
      user: { name, username, email } // Trả về thông tin người dùng
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).send({ message: err.message });
  }
};

const login = async (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({ message: 'Email/Username and password are required' });
  }

  try {
    const pool = await poolPromise;
    const query = 'SELECT * FROM [User] WHERE Email = @EmailOrUsername OR Username = @EmailOrUsername';
    const result = await pool.request()
      .input('EmailOrUsername', sql.VarChar, emailOrUsername)
      .query(query);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];

      if (user.Status === 0) {
        return res.status(401).json({ message: 'Email not confirmed. Please check your email.' });
      }

      const isMatch = await bcrypt.compare(password, user.Password);
      if (isMatch) {
        req.session.user = user;
        res.status(200).json({ message: 'User logged in successfully!', user: { id: user.Id, name: user.Name, email: user.Email } });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed', error: err.message });
      }

      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'User logged out successfully!' });
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = {
  register,
  login,
  logout
};
