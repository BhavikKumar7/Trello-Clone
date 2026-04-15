import { getBoardData, createBoard, updateBoard, getAllBoardsService, deleteBoardService, reorderBoards } from "../services/boardService.js";

export const getBoard = async (req, res) => {
  try {
    const boardId = req.params.id;
    const rows = await getBoardData(boardId);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Board not found" });
    }

    const board = {
      id: rows[0].board_id,
      title: rows[0].board_title,
      background: rows[0].board_background,
      lists: []
    };

    const listMap = {};

    rows.forEach(row => {
      if (!row.list_id) return;

      // 🔹 Create list if not exists
      if (!listMap[row.list_id]) {
        listMap[row.list_id] = {
          id: row.list_id,
          title: row.list_title,
          position: row.list_position,
          cards: [],
          cardsMap: {} // ✅ move here
        };
        board.lists.push(listMap[row.list_id]);
      }

      if (row.card_id) {

        // 🔹 Create card if not exists
        if (!listMap[row.list_id].cardsMap[row.card_id]) {
          listMap[row.list_id].cardsMap[row.card_id] = {
            id: row.card_id,
            title: row.card_title,
            description: row.card_description,
            due_date: row.card_due_date,
            is_completed: row.card_completed,
            position: row.card_position,

            // ✅ SINGLE LABEL
            label: row.label_id
              ? {
                id: row.label_id,
                name: row.label_name,
                color: row.label_color
              }
              : null,

            members: []
          };

          listMap[row.list_id].cards.push(
            listMap[row.list_id].cardsMap[row.card_id]
          );
        }

        // 🔹 ADD MEMBERS ONLY (NO LABEL PUSH)
        if (row.user_id) {
          const members = listMap[row.list_id].cardsMap[row.card_id].members;

          if (!members.find(m => m.id === row.user_id)) {
            members.push({
              id: row.user_id,
              name: row.user_name
            });
          }
        }
      }
    });

    res.json(board);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createNewBoard = async (req, res) => {
  try {
    const { title, background } = req.body;

    const result = await createBoard(title, background);

    res.status(201).json({
      id: result.insertId,
      title,
      background
    });

  } catch (error) {
    res.status(500).json({ message: "Error creating board" });
  }
};

export const updateBoardDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, background } = req.body;

    await updateBoard(id, title, background);

    res.json({ message: "Board updated" });

  } catch (error) {
    res.status(500).json({ message: "Error updating board" });
  }
};

export const getAllBoards = async (req, res) => {
  try {
    const boards = await getAllBoardsService();
    res.json(boards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching boards" });
  }
};

export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteBoardService(id);
    res.json({ message: "Board deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting board" });
  }
};

export const reorderBoardsHandler = async (req, res) => {
  try {
    const { boards } = req.body;

    await reorderBoards(boards);

    res.json({ message: "Boards reordered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error reordering boards" });
  }
};