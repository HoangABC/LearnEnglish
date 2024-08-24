const { poolPromise, sql } = require('../config/db');

const findOne = async (condition) => {
  const pool = await poolPromise;
  const query = `
    SELECT * FROM [User]
    WHERE GoogleId = @googleId OR Email = @Email
  `;
  const result = await pool.request()
    .input('googleId', sql.NVarChar, condition.googleId || null)
    .input('Email', sql.NVarChar, condition.email || null)
    .query(query);
  return result.recordset[0];
};

const create = async (user) => {
  const pool = await poolPromise;
  await pool.request()
    .input('googleId', sql.NVarChar, user.googleId)
    .input('name', sql.NVarChar, user.name)
    .input('username', sql.NVarChar, user.username || null)
    .input('email', sql.NVarChar, user.email)
    .input('password', sql.NVarChar, user.password || null) // Có thể bỏ qua nếu không cần
    .query(`
      INSERT INTO [User] (GoogleId, Name, Username, Email, Password)
      VALUES (@googleId, @name, @username, @email, @password)
    `);
};

const updateGoogleId = async (email, googleId) => {
  const pool = await poolPromise;
  await pool.request()
    .input('email', sql.NVarChar, email)
    .input('googleId', sql.NVarChar, googleId)
    .query(`
      UPDATE [User]
      SET GoogleId = @googleId
      WHERE Email = @email
    `);
};

module.exports = { findOne, create, updateGoogleId };
