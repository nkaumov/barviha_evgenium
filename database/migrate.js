const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { adminPool } = require("../config/db");

const dbName = process.env.DB_NAME;
const migrationsDir = path.join(__dirname, "migrations");

if (!dbName) {
  throw new Error("DB_NAME is required in .env");
}

const run = async () => {
  await adminPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await adminPool.query(`USE \`${dbName}\`;`);

  await adminPool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      filename VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_migrations_filename (filename)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const [executedRows] = await adminPool.query("SELECT filename FROM _migrations");
  const executed = new Set(executedRows.map((row) => row.filename));

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => /^\d+.*\.sql$/.test(file))
    .sort();

  for (const file of files) {
    if (executed.has(file)) {
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    const statements = sql
      .split(/;\s*\r?\n/g)
      .map((s) => s.trim())
      .filter(Boolean);

    const connection = await adminPool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(`USE \`${dbName}\`;`);
      for (const statement of statements) {
        await connection.query(statement);
      }
      await connection.query("INSERT INTO _migrations (filename) VALUES (?)", [file]);
      await connection.commit();
      console.log(`Applied migration: ${file}`);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  await adminPool.end();
};

run().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
