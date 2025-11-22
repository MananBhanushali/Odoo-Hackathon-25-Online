import { api } from './api';
import { Move } from '../types';

export const moveService = {
  list: async (params?: { direction?: 'in' | 'out' | 'internal'; productId?: string }): Promise<Move[]> => {
    const query = new URLSearchParams();
    if (params?.direction) query.append('direction', params.direction.toUpperCase());
    if (params?.productId) query.append('productId', params.productId);
    return api.get(`/operations/moves/history?${query.toString()}`);
  }
};
