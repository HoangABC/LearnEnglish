const sql = require('mssql/msnodesqlv8');
const { DB_USER, DB_PASSWORD, DB_SERVER, DB_DATABASE } = require('dotenv').config().parsed;

const config = {
  server: DB_SERVER,
  database: DB_DATABASE,
  driver: 'msnodesqlv8',
  options: {
    encrypt: false,
    trustedConnection: true,
    instanceName: 'SQLEXPRESS'
  },
  requestTimeout: 300000, 
};


const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

module.exports = { poolPromise, sql };
