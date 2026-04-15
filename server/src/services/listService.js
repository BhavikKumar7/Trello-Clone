import db from "../config/db.js";

export const createList = (boardId, title, position) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO lists (board_id, title, position)
      VALUES (?, ?, ?)
    `;

    db.query(query, [boardId, title, position], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const updateList = (id, title) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE lists SET title = ? WHERE id = ?";

    db.query(query, [title, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const deleteList = (id) => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM lists WHERE id = ?";

    db.query(query, [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const reorderLists = (lists) => {
  return new Promise((resolve, reject) => {
    const queries = lists.map(list => {
      return new Promise((res, rej) => {
        const query = "UPDATE lists SET position = ? WHERE id = ?";
        db.query(query, [list.position, list.id], (err) => {
          if (err) return rej(err);
          res();
        });
      });
    });

    Promise.all(queries)
      .then(() => resolve())
      .catch(err => reject(err));
  });
};

