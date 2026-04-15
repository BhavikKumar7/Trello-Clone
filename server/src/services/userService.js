import db from "../config/db.js";

export const getAllUsersService = () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT id, name, email FROM users";

    db.query(query, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};