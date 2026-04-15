import express from "express";
import {
  createNewCard,
  moveCardHandler,
  deleteCardById,
  updateCardHandler,
  addLabelHandler,
  removeLabelHandler,
  updateDueDateHandler,
  addChecklistHandler,
  toggleChecklistHandler,
  assignMemberHandler,
  removeMemberHandler,
  toggleCardCompletionHandler
} from "../controllers/cardController.js";

const router = express.Router();

router.post("/", createNewCard);
router.patch("/move", moveCardHandler);
router.delete("/:id", deleteCardById);
router.put("/:id", updateCardHandler); 
router.post("/:id/labels", addLabelHandler);
router.delete("/:id/labels/:labelId", removeLabelHandler);
router.patch("/:id/duedate", updateDueDateHandler);
router.post("/:id/checklist", addChecklistHandler);
router.patch("/checklist/:itemId", toggleChecklistHandler);
router.post("/:id/members", assignMemberHandler);
router.delete("/:id/members/:userId", removeMemberHandler);
router.patch("/:id/complete", toggleCardCompletionHandler);

export default router;