import { Router } from "express";
import {
  addComment,
  getTaskComments,
  deleteComment,
} from "../controllers/commentController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.post("/", addComment);
router.get("/:taskId", getTaskComments);
router.delete("/:id", deleteComment);

export default router;
