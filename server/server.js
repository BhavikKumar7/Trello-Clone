import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import app from "./src/app.js";
import db from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

db.getConnection((err, connection) => {
  if (err) {
    console.error("DB Pool Connection Failed:", err);
  } else {
    console.log("MySQL Pool Connected");
    connection.release();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});