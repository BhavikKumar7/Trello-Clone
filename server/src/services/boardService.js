import db from "../config/db.js";

export const getBoardData = (boardId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
  b.id AS board_id,
  b.title AS board_title,
  b.background AS board_background,

  l.id AS list_id,
  l.title AS list_title,
  l.position AS list_position,

  c.id AS card_id,
  c.title AS card_title,
  c.description AS card_description,
  c.due_date AS card_due_date,
  c.is_completed AS card_completed,
  c.position AS card_position,

  -- SINGLE LABEL
  lb.id AS label_id,
  lb.name AS label_name,
  lb.color AS label_color,

  -- MEMBERS
  u.id AS user_id,
  u.name AS user_name

FROM boards b

LEFT JOIN lists l 
  ON l.board_id = b.id

LEFT JOIN cards c 
  ON c.list_id = l.id

-- ONLY ONE LABEL PER CARD
LEFT JOIN card_labels cl 
  ON cl.card_id = c.id
LEFT JOIN labels lb 
  ON lb.id = cl.label_id

-- MEMBERS
LEFT JOIN card_members cm 
  ON cm.card_id = c.id
LEFT JOIN users u 
  ON u.id = cm.user_id

WHERE b.id = ?

ORDER BY 
  l.position ASC, 
  c.position ASC;
    `;

    db.query(query, [boardId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

export const createBoard = (title, background) => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO boards (title, background) VALUES (?, ?)";

    db.query(query, [title, background], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const updateBoard = (id, title, background) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE boards SET title = ?, background = ? WHERE id = ?";

    db.query(query, [title, background, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const getAllBoardsService = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT id, title, background
      FROM boards
      ORDER BY position ASC;
    `;

    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

export const deleteBoardService = (id) => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM boards WHERE id = ?";

    db.query(query, [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const reorderBoards = (boards) => {
  return new Promise((resolve, reject) => {
    const queries = boards.map((board) => {
      return new Promise((res, rej) => {
        const query = "UPDATE boards SET position = ? WHERE id = ?";
        db.query(query, [board.position, board.id], (err) => {
          if (err) return rej(err);
          res();
        });
      });
    });

    Promise.all(queries)
      .then(() => resolve())
      .catch((err) => reject(err));
  });
};