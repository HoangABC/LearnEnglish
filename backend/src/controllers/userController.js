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
  
  // Kiểm tra các trường bắt buộc
  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: 'Tên, tên đăng nhập, email và mật khẩu là bắt buộc' });
  }

  // Kiểm tra độ dài của Name và Username
  if (name.length < 5) {
    return res.status(400).json({ message: 'Tên phải có ít nhất 5 ký tự' });
  }
  
  if (username.length < 5) {
    return res.status(400).json({ message: 'Tên đăng nhập phải có ít nhất 5 ký tự' });
  }

  // Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email không đúng định dạng' });
  }

  try {
    const pool = await poolPromise;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Kiểm tra xem email đã tồn tại chưa
    const existingUserByEmail = await pool.request()
      .input('Email', sql.VarChar, email)
      .query('SELECT * FROM [User] WHERE Email = @Email');

    if (existingUserByEmail.recordset.length > 0) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    // Kiểm tra xem tên đăng nhập đã tồn tại chưa
    const existingUserByUsername = await pool.request()
      .input('Username', sql.VarChar, username)
      .query('SELECT * FROM [User] WHERE Username = @Username');

    if (existingUserByUsername.recordset.length > 0) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    // Kiểm tra xem tên đã tồn tại chưa
    const existingUserByName = await pool.request()
      .input('Name', sql.NVarChar, name)
      .query('SELECT * FROM [User] WHERE Name = @Name');

    if (existingUserByName.recordset.length > 0) {
      return res.status(400).json({ message: 'Tên đã tồn tại' });
    }

    // Nếu không trùng lặp, tiến hành đăng ký
    await pool.request()
      .input('LevelId', sql.NVarChar, null)
      .input('GoogleId', sql.NVarChar, null)
      .input('Name', sql.NVarChar, name)
      .input('Username', sql.VarChar, username)
      .input('Email', sql.VarChar, email)
      .input('Password', sql.NVarChar, hashedPassword)
      .input('ConfirmationToken', sql.NVarChar, null)
      .input('Status', sql.Int, 1)
      .query('INSERT INTO [User] (LevelId, GoogleId, Name, Username, Email, Password, ConfirmationToken, Status) VALUES (@LevelId, @GoogleId, @Name, @Username, @Email, @Password, @ConfirmationToken, @Status)');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Cảm ơn bạn đã đăng ký!',
      text: 'Cảm ơn bạn đã đăng ký tài khoản với chúng tôi. Bạn có thể đăng nhập ngay lập tức!'
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: 'Đăng ký tài khoản thành công!',
      user: { name, username, email }
    });

  } catch (err) {
    console.error('Lỗi đăng ký:', err);
    res.status(500).send({ message: 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.' });
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
            LevelId: user.LevelId, 
            Password: user.Password
          } 
        });
      } else {
        res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác.' });
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

 
    const levelCheck = await pool.request()
      .input('LevelId', sql.Int, levelId)
      .query('SELECT Id FROM [Level] WHERE Id = @LevelId');

    if (levelCheck.recordset.length === 0) {
      return res.status(400).json({ message: 'Invalid LevelId' });
    }

   
    const result = await pool.request()
      .input('Id', sql.Int, id)
      .input('LevelId', sql.Int, levelId)
      .query(`
        UPDATE [User]
        SET LevelId = @LevelId
        WHERE Id = @Id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User LevelId updated successfully' });
  } catch (err) {
    console.error('Database error:', err.message);  
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
    console.error('Database error:', err.message); 
    res.status(500).send({ message: 'Internal server error' });
  }
};

const updateUserName = async (req, res) => {
  const { userId, name } = req.body;

  console.log('thong tin:',userId);
  if (!userId || !name) {
    return res.status(400).json({ message: 'UserId and name are required' });
  }

  try {
    const pool = await poolPromise;

    
    const userCheck = await pool.request()
      .input('UserId', sql.Int, userId)
      .query('SELECT * FROM [User] WHERE Id = @UserId');

    if (userCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }


    const nameCheck = await pool.request()
      .input('Name', sql.NVarChar, name)
      .query('SELECT * FROM [User] WHERE Name = @Name');

    if (nameCheck.recordset.length > 0) {
      return res.status(400).json({ message: 'Tên đã tồn tại. Vui lòng chọn tên khác.' });
    }

   
    await pool.request()
      .input('UserId', sql.Int, userId)
      .input('Name', sql.NVarChar, name)
      .query(`
        UPDATE [User]
        SET Name = @Name
        WHERE Id = @UserId
      `);

    res.status(200).json({ message: 'Tên người dùng đã được cập nhật thành công' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  console.log('userId ở đây', userId);  
  
  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ message: 'UserId, mật khẩu cũ và mật khẩu mới là bắt buộc' });
  }

  try {
    const pool = await poolPromise;

    const userResult = await pool.request()
      .input('UserId', sql.Int, userId)
      .query('SELECT Password FROM [User] WHERE Id = @UserId');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const user = userResult.recordset[0];


    if (!user.Password) {
      return res.status(400).json({ message: 'Mật khẩu người dùng không hợp lệ' });
    }

    console.log('Mật khẩu cũ:', oldPassword);
    console.log('Mật khẩu đã băm:', user.Password);

    const isMatch = await bcrypt.compare(oldPassword, user.Password);
    if (!isMatch) {
      console.log('Mật khẩu cũ không chính xác');  
      return res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await pool.request()
      .input('UserId', sql.Int, userId)
      .input('NewPassword', sql.NVarChar, hashedNewPassword)
      .query('UPDATE [User] SET Password = @NewPassword WHERE Id = @UserId');

    res.status(200).json({ message: 'Mật khẩu đã được thay đổi thành công' });
  } catch (err) {
    console.error('Lỗi khi thay đổi mật khẩu:', err);
    res.status(500).send({ message: 'Đã xảy ra lỗi khi thay đổi mật khẩu. Vui lòng thử lại sau.' });
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
  getAllLevels,
  updateUserName, 
  changePassword,
};
