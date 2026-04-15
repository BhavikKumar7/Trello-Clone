import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // still fine to keep

import app from "./src/app.js";
import db from "./src/config/db.js";

db.connect((err) => {
  if (err) {
    console.error("DB Connection Failed:", err);
  } else {
    console.log("MySQL Connected");
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});