import { api } from './api';
import { Product } from '../types';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    return api.get('/products');
  },

  getById: async (id: string): Promise<Product> => {
    return api.get(`/products/${id}`);
  },

  create: async (product: Partial<Product>): Promise<Product> => {
    return api.post('/products', product);
  },

  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    return api.put(`/products/${id}`, product);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/products/${id}`);
  },
};
