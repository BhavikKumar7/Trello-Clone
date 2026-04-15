import db from "../config/db.js";

export const createCard = (listId, title) => {
  return new Promise((resolve, reject) => {

    const getMaxQuery = `
      SELECT MAX(position) AS maxPos FROM cards WHERE list_id = ?
    `;

    db.query(getMaxQuery, [listId], (err, result) => {
      if (err) return reject(err);

      const newPosition = (result[0].maxPos || 0) + 1;

      const insertQuery = `
        INSERT INTO cards (list_id, title, position)
        VALUES (?, ?, ?)
      `;

      db.query(insertQuery, [listId, title, newPosition], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  });
};

export const moveCard = ({ cardId, sourceListId, destinationListId, newPosition }) => {
  return new Promise((resolve, reject) => {

    // 🔹 Step 0: Get old position
    const getCardQuery = "SELECT position FROM cards WHERE id = ?";

    db.query(getCardQuery, [cardId], (err, result) => {
      if (err) return reject(err);

      if (!result || result.length === 0) {
        return reject(new Error("Card not found"));
      }

      const oldPosition = result[0].position;

      if (sourceListId === destinationListId) {

        // ✅ prevent unnecessary update
        if (oldPosition === newPosition) return resolve();

        let shiftQuery;
        let values;

        if (newPosition > oldPosition) {
          // 🔽 moving DOWN
          shiftQuery = `
      UPDATE cards
      SET position = position - 1
      WHERE list_id = ? AND position > ? AND position <= ?
    `;
          values = [sourceListId, oldPosition, newPosition];
        } else {
          // 🔼 moving UP
          shiftQuery = `
      UPDATE cards
      SET position = position + 1
      WHERE list_id = ? AND position >= ? AND position < ?
    `;
          values = [sourceListId, newPosition, oldPosition];
        }

        db.query(shiftQuery, values, (err) => {
          if (err) return reject(err);

          const updateQuery = `
      UPDATE cards
      SET position = ?
      WHERE id = ?
    `;

          db.query(updateQuery, [newPosition, cardId], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }

      else {
        // 🔥 DIFFERENT LIST MOVE

        // Step 1: Fix source list (REMOVE GAP)
        const fixSource = `
          UPDATE cards
          SET position = position - 1
          WHERE list_id = ? AND position > ?
        `;

        db.query(fixSource, [sourceListId, oldPosition], (err) => {
          if (err) return reject(err);

          // Step 2: Shift destination list
          const shiftDest = `
            UPDATE cards
            SET position = position + 1
            WHERE list_id = ? AND position >= ?
          `;

          db.query(shiftDest, [destinationListId, newPosition], (err) => {
            if (err) return reject(err);

            // Step 3: Move card
            const updateCard = `
              UPDATE cards
              SET list_id = ?, position = ?
              WHERE id = ?
            `;

            db.query(updateCard, [destinationListId, newPosition, cardId], (err) => {
              if (err) return reject(err);

              resolve();
            });
          });
        });
      }
    });
  });
};

export const updateCard = (id, title, description) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE cards 
      SET title = ?, description = ?
      WHERE id = ?
    `;

    db.query(query, [title, description, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const deleteCard = (id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM cards WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const addLabelToCard = (cardId, labelId) => {
  return new Promise((resolve, reject) => {

    // 🔹 Step 1: remove existing label
    const deleteQuery = `
      DELETE FROM card_labels WHERE card_id = ?
    `;

    db.query(deleteQuery, [cardId], (err) => {
      if (err) return reject(err);

      // 🔹 Step 2: insert new label
      const insertQuery = `
        INSERT INTO card_labels (card_id, label_id)
        VALUES (?, ?)
      `;

      db.query(insertQuery, [cardId, labelId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

  });
};

export const removeLabelFromCard = (cardId, labelId) => {
  return new Promise((resolve, reject) => {
    const query = `
      DELETE FROM card_labels
      WHERE card_id = ? AND label_id = ?
    `;

    db.query(query, [cardId, labelId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const updateDueDate = (cardId, dueDate) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE cards SET due_date = ? WHERE id = ?
    `;

    const value = dueDate ? dueDate : null;

    db.query(query, [value, cardId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const addChecklistItem = (cardId, text) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO checklist_items (card_id, text)
      VALUES (?, ?)
    `;

    db.query(query, [cardId, text], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const toggleChecklistItem = (itemId, isCompleted) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE checklist_items
      SET is_completed = ?
      WHERE id = ?
    `;

    db.query(query, [isCompleted, itemId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const assignMember = (cardId, userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO card_members (card_id, user_id)
      VALUES (?, ?)
    `;

    db.query(query, [cardId, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const removeMember = (cardId, userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      DELETE FROM card_members
      WHERE card_id = ? AND user_id = ?
    `;

    db.query(query, [cardId, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const toggleCardCompletion = (cardId, isCompleted) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE cards 
      SET is_completed = ?
      WHERE id = ?
    `;

    db.query(query, [isCompleted, cardId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};