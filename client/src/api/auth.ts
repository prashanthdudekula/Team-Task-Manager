import api from './client';
import { LoginForm, RegisterForm, User } from '../types';

interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export const authApi = {
  register: async (data: Omit<RegisterForm, 'confirmPassword'>): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginForm): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
