import { z } from "zod";
import { TaskStatus, Priority, ProjectRole, Role } from "@prisma/client";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(255).optional(),
  description: z.string().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string().datetime().optional(),
  projectId: z.string().cuid("Invalid project ID"),
  assignedTo: z.string().cuid("Invalid user ID"),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255).optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().datetime().optional(),
  assignedTo: z.string().cuid("Invalid user ID").optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export const createCommentSchema = z.object({
  message: z.string().min(1, "Message is required"),
  taskId: z.string().cuid("Invalid task ID"),
});

export const updateUserSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
  status: z.enum(["PENDING", "ACTIVE", "REJECTED"]).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
