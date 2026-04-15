import express from "express";
import {
  createNewList,
  updateListTitle,
  deleteListById,
  reorderListHandler
} from "../controllers/listController.js";

const router = express.Router();

router.post("/", createNewList);
router.put("/:id", updateListTitle);
router.delete("/:id", deleteListById);
router.patch("/reorder", reorderListHandler);

export default router;