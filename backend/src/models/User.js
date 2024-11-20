const { poolPromise, sql } = require('../config/db');

// Hàm tìm người dùng
const findOne = async (condition) => {
  const pool = await poolPromise;
  const query = `
    SELECT Id, GoogleId, Name, Email, LevelId, Image
    FROM [User]
    WHERE GoogleId = @googleId OR Email = @Email
  `;
  const result = await pool.request()
    .input('googleId', sql.NVarChar, condition.googleId || null)
    .input('Email', sql.NVarChar, condition.email || null)
    .query(query);

  if (result.recordset.length > 0) {
    return result.recordset[0];  // Trả về người dùng đầu tiên tìm thấy
  } else {
    return null;  // Trả về null nếu không tìm thấy người dùng
  }
};

// Hàm tạo người dùng mới
const create = async (user) => {
  const pool = await poolPromise;
  // Thêm người dùng vào cơ sở dữ liệu
  await pool.request()
    .input('googleId', sql.NVarChar, user.googleId)
    .input('name', sql.NVarChar, user.name)
    .input('email', sql.NVarChar, user.email)
    .input('levelId', sql.Int, user.levelId || null)
    .input('image', sql.NVarChar, user.image || null) 
    .query(`
      INSERT INTO [User] (GoogleId, Name, Email, LevelId, Image)
      VALUES (@googleId, @name, @email, @levelId, @image)
    `);


  const result = await pool.request()
    .input('googleId', sql.NVarChar, user.googleId)
    .query('SELECT Id FROM [User] WHERE GoogleId = @googleId');

  return result.recordset[0].Id; 
};

// Hàm cập nhật GoogleId của người dùng
const updateGoogleId = async (email, googleId, image) => {
  const pool = await poolPromise;
  await pool.request()
    .input('email', sql.NVarChar, email)
    .input('googleId', sql.NVarChar, googleId)
    .input('image', sql.NVarChar, image)
    .query(`
      UPDATE [User]
      SET GoogleId = @googleId, Image = @image
      WHERE Email = @email
    `);
};

module.exports = { findOne, create, updateGoogleId };
