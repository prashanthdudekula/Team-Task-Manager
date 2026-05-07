import { Router } from "express";
import {
  getAllUsers,
  updateProfile,
  changePassword,
  approveUser,
  rejectUser,
  updateUser,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getAllUsers);
router.put("/profile", updateProfile);
router.put("/password", changePassword);

// Admin-only routes
router.put("/:id/approve", approveUser);
router.put("/:id/reject", rejectUser);
router.put("/:id", updateUser);

export default router;
