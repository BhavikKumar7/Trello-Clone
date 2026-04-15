import {
  createCard,
  moveCard,
  updateCard,
  deleteCard,
  addLabelToCard,
  removeLabelFromCard,
  updateDueDate,
  addChecklistItem,
  toggleChecklistItem,
  assignMember,
  removeMember,
  toggleCardCompletion
} from "../services/cardService.js";


export const createNewCard = async (req, res) => {
  try {
    const { listId, title } = req.body;

    const result = await createCard(listId, title);

    res.status(201).json({
      id: result.insertId,
      title
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating card" });
  }
};

export const moveCardHandler = async (req, res) => {
  try {
    const { cardId, sourceListId, destinationListId, newPosition } = req.body;

    await moveCard({ cardId, sourceListId, destinationListId, newPosition });

    res.json({ message: "Card moved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error moving card" });
  }
};

export const updateCardHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    await updateCard(id, title, description);

    res.json({ message: "Card updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating card" });
  }
};

export const deleteCardById = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteCard(id);

    res.json({ message: "Card deleted" });

  } catch (err) {
    res.status(500).json({ message: "Error deleting card" });
  }
};

export const addLabelHandler = async (req, res) => {
  try {
    const { id } = req.params; // cardId
    const { labelId } = req.body;

    await addLabelToCard(id, labelId);

    res.json({ message: "Label added" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding label" });
  }
};

export const removeLabelHandler = async (req, res) => {
  try {
    const { id, labelId } = req.params;

    await removeLabelFromCard(id, labelId);

    res.json({ message: "Label removed" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error removing label" });
  }
};

export const updateDueDateHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const dueDate = req.body.dueDate && req.body.dueDate !== ""
      ? req.body.dueDate
      : null;

    await updateDueDate(id, dueDate);

    res.json({ message: "Due date updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating due date" });
  }
};

export const addChecklistHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const result = await addChecklistItem(id, text);

    res.json({
      message: "Checklist item added",
      itemId: result.insertId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding checklist item" });
  }
};

export const toggleChecklistHandler = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { isCompleted } = req.body;

    await toggleChecklistItem(itemId, isCompleted);

    res.json({ message: "Checklist updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating checklist" });
  }
};

export const assignMemberHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    await assignMember(id, userId);

    res.json({ message: "Member assigned" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error assigning member" });
  }
};

export const removeMemberHandler = async (req, res) => {
  try {
    const { id, userId } = req.params;

    await removeMember(id, userId);

    res.json({ message: "Member removed" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error removing member" });
  }
};

export const toggleCardCompletionHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { isCompleted } = req.body;

    await toggleCardCompletion(id, isCompleted);

    res.json({ message: "Card status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating status" });
  }
};