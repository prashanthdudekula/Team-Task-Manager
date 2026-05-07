import client from './client';

export interface SearchResult {
  projects: { id: string; title: string }[];
  tasks: { id: string; title: string; projectId: string }[];
  users: { id: string; name: string; email: string }[];
}

export const searchApi = {
  query: async (q: string) => {
    const res = await client.get<{ success: boolean; results: SearchResult }>(`/search?q=${encodeURIComponent(q)}`);
    return res.data;
  },
};
