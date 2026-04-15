import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import mysql from "mysql2";
import fs from "fs";

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca: fs.readFileSync("./ca.pem"),
    rejectUnauthorized: true,
  }
});

export default db;