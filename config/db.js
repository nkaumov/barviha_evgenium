const mysql = require("mysql2/promise");

const baseConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool({
  ...baseConfig,
  database: process.env.DB_NAME
});

const adminPool = mysql.createPool(baseConfig);

module.exports = {
  pool,
  adminPool
};
