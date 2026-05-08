export type Role = 'ADMIN' | 'MEMBER';
export type ProjectRole = 'ADMIN' | 'MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  members: ProjectMember[];
  tasks?: TaskSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskSummary {
  id: string;
  status: TaskStatus;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  projectId: string;
  assignedTo: string;
  createdBy: string;
  comments?: Comment[];
  assignee: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  completionRate: number;
  totalProjects: number;
  tasksByStatus: { status: TaskStatus; _count: number }[];
  tasksByPriority: { priority: Priority; _count: number }[];
  recentActivities: Task[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ message: string }>;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreateProjectForm {
  title: string;
  description?: string;
}

export interface CreateTaskForm {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  projectId: string;
  assignedTo: string;
}
