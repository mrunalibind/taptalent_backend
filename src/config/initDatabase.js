const fs = require("fs");
const path = require("path");
const pool = require("./db.js"); // your mysql connection pool

async function initDatabase() {
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf8");

    await pool.query(sql);

    console.log("Database & tables initialized successfully.");
  } catch (err) {
    console.error("Database initialization failed:", err);
    throw err; // Rethrow to be caught in server.js
  }
}

module.exports = initDatabase;