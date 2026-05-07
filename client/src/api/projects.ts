import api from './client';
import { Project, CreateProjectForm } from '../types';

export const projectsApi = {
  getAll: async () => {
    const response = await api.get<{ success: boolean; projects: Project[] }>('/projects');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; project: Project }>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: CreateProjectForm) => {
    const response = await api.post<{ success: boolean; project: Project }>('/projects', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateProjectForm>) => {
    const response = await api.put<{ success: boolean; project: Project }>(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/projects/${id}`);
    return response.data;
  },

  addMember: async (projectId: string, userId: string, role: 'ADMIN' | 'MEMBER') => {
    const response = await api.post(`/team/project/${projectId}`, { userId, role });
    return response.data;
  },

  removeMember: async (projectId: string, userId: string) => {
    const response = await api.delete(`/team/project/${projectId}/${userId}`);
    return response.data;
  },
};
