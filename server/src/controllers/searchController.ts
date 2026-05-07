import { Response } from "express";
import { prisma } from "../config/database.js";
import { AuthRequest } from "../types/index.js";

export const globalSearch = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const query = (req.query.q as string) || "";
    if (!query || query.length < 2) {
      return res.status(200).json({
        success: true,
        results: { projects: [], tasks: [], users: [] },
      });
    }

    const isAdmin = req.user.role === "ADMIN";

    // Search Projects
    const projects = await prisma.project.findMany({
      where: {
        AND: [
          { title: { contains: query, mode: "insensitive" } },
          // Members see only their projects, Admins see all
          ...(isAdmin ? [] : [{
            members: {
              some: { userId: req.user.id }
            }
          }])
        ]
      },
      select: {
        id: true,
        title: true,
      },
      take: 5,
    });

    // Search Tasks
    const tasks = await prisma.task.findMany({
      where: {
        AND: [
          { title: { contains: query, mode: "insensitive" } },
          // Members see tasks in their projects, Admins see all
          ...(isAdmin ? [] : [{
            project: {
              members: {
                some: { userId: req.user.id }
              }
            }
          }])
        ]
      },
      select: {
        id: true,
        title: true,
        projectId: true,
      },
      take: 5,
    });

    // Search Users (Admin only or anyone depending on privacy, usually anyone in team)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 5,
    });

    return res.status(200).json({
      success: true,
      results: {
        projects,
        tasks,
        users,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
