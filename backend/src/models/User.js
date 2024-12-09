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
    return result.recordset[0];  
  } else {
    return null;  
  }
};


const create = async (user) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input('googleId', sql.NVarChar, user.googleId)
    .input('name', sql.NVarChar, user.name)
    .input('email', sql.NVarChar, user.email)
    .input('levelId', sql.Int, user.levelId || null)
    .input('image', sql.NVarChar, user.image)
    .query(`
      INSERT INTO [User] (GoogleId, Name, Email, LevelId, Image)
      VALUES (@googleId, @name, @email, @levelId, @image);
      SELECT SCOPE_IDENTITY() AS Id;
    `);

  return result.recordset[0].Id;
};


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
