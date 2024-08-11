const { poolPromise, sql } = require('../config/db');

const findOne = async (condition) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('googleId', sql.NVarChar, condition.googleId)
    .query('SELECT * FROM [User] WHERE GoogleId = @googleId');
  return result.recordset[0];
};

const create = async (user) => {
  const pool = await poolPromise;
  await pool.request()
    .input('googleId', sql.NVarChar, user.googleId)
    .input('name', sql.NVarChar, user.name)
    .input('email', sql.NVarChar, user.email)
    .input('password', sql.NVarChar, user.password || null) // Có thể bỏ qua nếu không cần
    .query(`
      INSERT INTO [User] (GoogleId, Name, Email, Password)
      VALUES (@googleId, @name, @email, @password)
    `);
};

module.exports = { findOne, create };
