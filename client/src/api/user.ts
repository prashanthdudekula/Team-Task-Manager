import client from './client';
import { User } from '../types';

export const userApi = {
  getUsers: async (search?: string, status?: string) => {
    const res = await client.get<{ success: boolean; users: User[] }>('/users', {
      params: { search, status }
    });
    return res.data;
  },
  
  updateProfile: async (data: { name: string }) => {
    const res = await client.put<{ success: boolean; user: User; message: string }>('/users/profile', data);
    return res.data;
  },
  
  changePassword: async (data: any) => {
    const res = await client.put<{ success: boolean; message: string }>('/users/password', data);
    return res.data;
  },

  approve: async (id: string) => {
    const res = await client.put<{ success: boolean; message: string }>(`/users/${id}/approve`);
    return res.data;
  },

  reject: async (id: string) => {
    const res = await client.put<{ success: boolean; message: string }>(`/users/${id}/reject`);
    return res.data;
  },
  
  updateUser: async (id: string, data: { role?: string, status?: string }) => {
    const res = await client.put<{ success: boolean; user: User; message: string }>(`/users/${id}`, data);
    return res.data;
  }
};
