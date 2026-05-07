import { Router } from "express";
import {
  addMember,
  removeMember,
  getProjectMembers,
} from "../controllers/teamController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/project/:id", getProjectMembers);
router.post("/project/:id", addMember);
router.delete("/project/:id/:userId", removeMember);

export default router;
