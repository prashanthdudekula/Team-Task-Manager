import { Request, Response } from "express";
import { prisma } from "../config/database.js";
import { addMemberSchema } from "../validators/index.js";
import { AuthRequest } from "../types/index.js";

export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const validation = addMemberSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.error.errors,
      });
    }

    const { userId, role } = validation.data;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const currentMember = project.members.find((m) => m.userId === req.user?.id);
    if (!currentMember || currentMember.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only admins can add members",
      });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingMember = project.members.find((m) => m.userId === userId);
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this project",
      });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      member,
    });
  } catch (error) {
    console.error("Add member error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id, userId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const currentMember = project.members.find((m) => m.userId === req.user?.id);
    if (!currentMember || currentMember.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only admins can remove members",
      });
    }

    const memberToRemove = project.members.find((m) => m.userId === userId);
    if (!memberToRemove) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    await prisma.projectMember.delete({
      where: { id: memberToRemove.id },
    });

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Remove member error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProjectMembers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isMember = project.members.some((m) => m.userId === req.user?.id);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    return res.status(200).json({
      success: true,
      members: project.members,
    });
  } catch (error) {
    console.error("Get members error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
