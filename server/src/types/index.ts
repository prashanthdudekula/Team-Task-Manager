import { Request } from "express";
import { Role, ProjectRole, TaskStatus, Priority } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

export interface UserPayload {
  id: string;
  email: string;
  role: Role;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateProjectDto {
  title: string;
  description?: string;
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: Date;
  projectId: string;
  assignedTo: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: Date;
  assignedTo?: string;
}

export interface AddMemberDto {
  userId: string;
  role: ProjectRole;
}

export interface CreateCommentDto {
  message: string;
  taskId: string;
}
