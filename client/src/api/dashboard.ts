import api from './client';
import { DashboardStats } from '../types';

export const dashboardApi = {
  getStats: async (global?: boolean) => {
    const response = await api.get<{ success: boolean; stats: DashboardStats }>('/dashboard/stats', {
      params: { global }
    });
    return response.data;
  },
};
