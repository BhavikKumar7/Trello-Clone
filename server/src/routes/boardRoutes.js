import express from "express";
import { getBoard, createNewBoard, updateBoardDetails, getAllBoards, deleteBoard, reorderBoardsHandler } from "../controllers/boardController.js";

const router = express.Router();

router.get("/", getAllBoards);
router.get("/:id", getBoard);
router.post("/", createNewBoard);
router.put("/:id", updateBoardDetails);
router.delete("/:id", deleteBoard);
router.patch("/reorder", reorderBoardsHandler);

export default router;