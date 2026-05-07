import { Request, Response } from "express";
import { prisma } from "../config/database.js";
import { AuthRequest } from "../types/index.js";

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const isGlobal = req.query.global === "true" && req.user.role === "ADMIN";
    
    let projectIds: string[] = [];
    let whereClause: any = {};

    if (isGlobal) {
      // For global stats, we don't filter by project membership
      whereClause = {};
      const allProjects = await prisma.project.findMany({ select: { id: true } });
      projectIds = allProjects.map(p => p.id);
    } else {
      const userProjects = await prisma.project.findMany({
        where: {
          members: {
            some: {
              userId: req.user.id,
            },
          },
        },
        select: {
          id: true,
        },
      });
      projectIds = userProjects.map((p) => p.id);
      whereClause = { projectId: { in: projectIds } };
    }

    const [totalTasks, completedTasks, overdueTasks, inProgressTasks] =
      await Promise.all([
        prisma.task.count({
          where: whereClause,
        }),
        prisma.task.count({
          where: {
            ...whereClause,
            status: "DONE",
          },
        }),
        prisma.task.count({
          where: {
            ...whereClause,
            dueDate: {
              lt: new Date(),
            },
            status: {
              not: "DONE",
            },
          },
        }),
        prisma.task.count({
          where: {
            ...whereClause,
            status: "IN_PROGRESS",
          },
        }),
      ]);

    const tasksByStatus = await prisma.task.groupBy({
      by: ["status"],
      where: whereClause,
      _count: true,
    });

    const tasksByPriority = await prisma.task.groupBy({
      by: ["priority"],
      where: whereClause,
      _count: true,
    });

    const recentActivities = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            title: true,
          },
        },
        assignee: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10,
    });

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        overdueTasks,
        inProgressTasks,
        completionRate,
        totalProjects: projectIds.length,
        tasksByStatus,
        tasksByPriority,
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
