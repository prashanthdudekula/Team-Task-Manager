import api from './client';
import { Task, CreateTaskForm, TaskStatus, Priority } from '../types';

export const tasksApi = {
  getByProject: async (projectId: string) => {
    const response = await api.get<{ success: boolean; tasks: Task[] }>(`/tasks/project/${projectId}`);
    return response.data;
  },

  create: async (data: CreateTaskForm) => {
    const response = await api.post<{ success: boolean; task: Task }>('/tasks', data);
    return response.data;
  },

  update: async (id: string, data: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: Priority;
    dueDate?: string;
    assignedTo?: string;
  }) => {
    const response = await api.put<{ success: boolean; task: Task }>(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/tasks/${id}`);
    return response.data;
  },

  addComment: async (taskId: string, message: string) => {
    const response = await api.post('/comments', { taskId, message });
    return response.data;
  },

  getComments: async (taskId: string) => {
    const response = await api.get(`/comments/${taskId}`);
    return response.data;
  },
};
