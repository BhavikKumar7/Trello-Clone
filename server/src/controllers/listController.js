import {
  createList,
  updateList,
  deleteList,
  reorderLists
} from "../services/listService.js";

export const createNewList = async (req, res) => {
  try {
    const { boardId, title, position } = req.body;

    const result = await createList(boardId, title, position);

    res.status(201).json({
      id: result.insertId,
      title,
      position
    });

  } //catch (err) {
//     res.status(500).json({ message: "Error creating list" });
//   }
catch (err) {
  console.error("CREATE LIST ERROR:", err);   // ✅ ADD THIS
  res.status(500).json({ message: err.message });
}
};

export const updateListTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    await updateList(id, title);

    res.json({ message: "List updated" });

  } catch (err) {
    res.status(500).json({ message: "Error updating list" });
  }
};

export const deleteListById = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteList(id);

    res.json({ message: "List deleted" });

  } catch (err) {
    res.status(500).json({ message: "Error deleting list" });
  }
};

export const reorderListHandler = async (req, res) => {
  try {
    const { lists } = req.body;

    await reorderLists(lists);

    res.json({ message: "Lists reordered" });

  } catch (err) {
    res.status(500).json({ message: "Error reordering lists" });
  }
};