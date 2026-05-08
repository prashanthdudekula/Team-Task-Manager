import { Response } from "express";
import { prisma } from "../config/database.js";
import { AuthRequest } from "../types/index.js";
import { sendApprovalEmail } from "../services/emailService.js";
import { updateUserSchema } from "../validators/index.js";
import bcryptjsModule from "bcryptjs";

// Handle CJS/ESM interop: bcryptjs is a CJS module
const bcrypt = (bcryptjsModule as any).default || bcryptjsModule;

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const search = (req.query.search as string) || "";
    const statusFilter = req.query.status as any; // Allow filtering by status

    const users = await prisma.user.findMany({
      where: {
        ...(search ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const approveUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
    }

    const userId = req.params.id;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
    });

    // Send the approval email
    sendApprovalEmail(user.email, user.name).catch((err) => console.error("Email error:", err));

    return res.status(200).json({ success: true, message: "User approved and email sent" });
  } catch (error) {
    console.error("Approve user error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const rejectUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
    }

    const userId = req.params.id;
    await prisma.user.update({
      where: { id: userId },
      data: { status: "REJECTED" },
    });

    return res.status(200).json({ success: true, message: "User registration rejected" });
  } catch (error) {
    console.error("Reject user error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
// ... existing updateProfile and changePassword ...
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { name } = req.body;

    if (!name || name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
    }

    const { id } = req.params;
    const validation = updateUserSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: validation.error.errors,
      });
    }

    const { role, status } = validation.data;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error: any) {
    console.error("Update user error detail:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
