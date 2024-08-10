const bcrypt = require('bcrypt');
const { poolPromise, sql } = require('../config/db');

const saltRounds = 10;

const findUserByGoogleId = async (googleId) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('googleId', sql.VarChar, googleId)
    .query('SELECT * FROM [User] WHERE googleId = @googleId');
  return result.recordset[0];
};

const createUser = async (user) => {
  const pool = await poolPromise;
  await pool.request()
    .input('googleId', sql.VarChar, user.googleId)
    .input('fullname', sql.NVarChar, user.fullname)
    .input('email', sql.VarChar, user.email)
    .query('INSERT INTO [User] (googleId, fullname, email) VALUES (@googleId, @fullname, @email)');
};

const register = async (req, res) => {
  try {
    const pool = await poolPromise;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    await pool.request()
      .input('Name', sql.NVarChar, req.body.fullname)
      .input('Username', sql.VarChar, req.body.username)
      .input('Password', sql.VarChar, hashedPassword)
      .input('Email', sql.VarChar, req.body.email)
      .input('Address', sql.NVarChar, req.body.address)
      .input('Phone', sql.VarChar, req.body.phone)
      .input('Birthday', sql.SmallDateTime, req.body.birthday)
      .query('INSERT INTO [User] (Name, Username, Password, Email, Address, Phone, Birthday) VALUES (@Name, @Username, @Password, @Email, @Address, @Phone, @Birthday)');

    res.status(200).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Email', sql.VarChar, email)
      .query('SELECT * FROM [User] WHERE Email = @Email');

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      // const isMatch = await bcrypt.compare(password, user.MatKhau);
      if (password === user.Password) {
        req.session.user = user; 
        res.status(200).json({ message: 'User logged in successfully!',
          user: {
            id: user.Id,
            name: user.Name,
            email: user.Email,
            password: user.Password,
          }
         });
        console.log('user:',user);
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    // } else {
    //   res.status(401).json({ message: 'Invalid credentials' }); // User not found
    // }
    //   if (isMatch) {
    //     req.session.user = user; 
    //     res.status(200).json({ message: 'User logged in successfully!' });
    //   } else {
    //     res.status(401).json({ message: 'Invalid credentials' });
    //   }
    } else {
      res.status(401).json({ message: 'Invalid credentials' }); // User not found
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const logout = (req, res) => {
  try {
    // Xóa thông tin người dùng khỏi session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed', error: err.message });
      }

      // Xóa cookie session nếu có
      res.clearCookie('connect.sid');
      
      // Trả về phản hồi thành công
      res.status(200).json({ message: 'User logged out successfully!' });
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload['sub'];
    const email = payload['email'];
    const fullname = payload['name'];

    let user = await findUserByGoogleId(googleId);

    if (!user) {
      user = await createUser({
        googleId,
        fullname,
        email,
      });
    }

    req.session.user = user;

    res.status(200).json({
      message: 'User logged in successfully!',
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Google login failed',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  logout,  
  findUserByGoogleId,
  createUser
};
