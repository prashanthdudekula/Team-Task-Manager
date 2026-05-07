import client from './client';
import { Comment } from '../types';

export const commentsApi = {
  getByTask: async (taskId: string) => {
    const res = await client.get<{ success: boolean; comments: Comment[] }>(`/comments/${taskId}`);
    return res.data;
  },

  create: async (data: { taskId: string; message: string }) => {
    const res = await client.post<{ success: boolean; comment: Comment }>('/comments', data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await client.delete<{ success: boolean }>(`/comments/${id}`);
    return res.data;
  }
};
