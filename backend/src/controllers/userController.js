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
      .query('SELECT * FROM [User] WHERE Email = @Email');

    if (existingUser.recordset.length > 0) {
      const user = existingUser.recordset[0];

      // Kiểm tra nếu người dùng đã đăng nhập bằng Google nhưng chưa có Username và Password
      if (!user.Username || !user.Password) {
        await pool.request()
          .input('Id', sql.Int, user.Id)
          .input('Username', sql.VarChar, username)
          .input('Password', sql.NVarChar, hashedPassword)
          .query(`
            UPDATE [User]
            SET Username = @Username, Password = @Password
            WHERE Id = @Id
          `);

        return res.status(200).json({
          message: 'User account updated successfully!',
          user: { name, username, email }
        });
      } else {
        return res.status(400).json({ message: 'Email already exists' });
      }
    } else {
      await pool.request()
        .input('LevelId', sql.NVarChar, null)
        .input('GoogleId', sql.NVarChar, null)
        .input('Name', sql.NVarChar, name)
        .input('Username', sql.VarChar, username)
        .input('Email', sql.VarChar, email)
        .input('Password', sql.NVarChar, hashedPassword)
        .input('ConfirmationToken', sql.NVarChar, null)
        .input('Status', sql.Int, 1)
        .query('INSERT INTO [User] (LevelId,GoogleId, Name, Username, Email, Password, ConfirmationToken, Status) VALUES (@LevelId,@GoogleId, @Name, @Username, @Email, @Password, @ConfirmationToken,  @Status)');

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Cảm ơn bạn đã đăng ký!',
        text: 'Cảm ơn bạn đã đăng ký tài khoản với chúng tôi. Bạn có thể đăng nhập ngay lập tức!'
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        message: 'User registered successfully!',
        user: { name, username, email }
      });
    }
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
        res.status(200).json({ 
          message: 'User logged in successfully!', 
          user: { 
            Id: user.Id, 
            name: user.Name, 
            email: user.Email, 
            LevelId: user.LevelId 
          } 
        });
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

const getAllUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM [User]');

    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, username, email, password, status } = req.body;

  if (!id || !name || !username || !email || !password || !status) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const pool = await poolPromise;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await pool.request()
      .input('Id', sql.Int, id)
      .input('Name', sql.NVarChar, name)
      .input('Username', sql.VarChar, username)
      .input('Email', sql.VarChar, email)
      .input('Password', sql.NVarChar, hashedPassword)
      .input('Status', sql.Int, status)
      .query(`
        UPDATE [User]
        SET Name = @Name, Username = @Username, Email = @Email, Password = @Password, Status = @Status
        WHERE Id = @Id
      `);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Id', sql.Int, id)
      .query('DELETE FROM [User] WHERE Id = @Id');

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const updateUserLevel = async (req, res) => {
  const { id } = req.params;
  const { levelId } = req.body;

  if (!id || levelId === undefined) {
    return res.status(400).json({ message: 'User ID and LevelId are required' });
  }

  try {
    const pool = await poolPromise;

    // Kiểm tra xem LevelId có tồn tại trong bảng Level không
    const levelCheck = await pool.request()
      .input('LevelId', sql.Int, levelId)
      .query('SELECT Id FROM [Level] WHERE Id = @LevelId');

    if (levelCheck.recordset.length === 0) {
      return res.status(400).json({ message: 'Invalid LevelId' });
    }

    // Cập nhật LevelId cho người dùng
    const result = await pool.request()
      .input('Id', sql.Int, id)
      .input('LevelId', sql.Int, levelId)
      .query(`
        UPDATE [User]
        SET LevelId = @LevelId
        WHERE Id = @Id
      `);

    // Kiểm tra nếu bản cập nhật không ảnh hưởng đến bất kỳ bản ghi nào
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User LevelId updated successfully' });
  } catch (err) {
    console.error('Database error:', err.message);  // Ghi log lỗi chi tiết
    res.status(500).send({ message: 'Internal server error' });
  }
};

const getAllLevels = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM [Level]');

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Database error:', err.message);  // Ghi log lỗi chi tiết
    res.status(500).send({ message: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  logout,
  getAllUsers,
  updateUser,
  deleteUser,
  updateUserLevel,
  getAllLevels // Export hàm mới
};
