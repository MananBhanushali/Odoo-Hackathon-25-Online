import { api } from './api';
import { Warehouse, Location } from '../types';

export const warehouseService = {
  getAll: async (): Promise<Warehouse[]> => {
    return api.get('/warehouses');
  },

  getById: async (id: string): Promise<Warehouse> => {
    return api.get(`/warehouses/${id}`);
  },

  create: async (warehouse: Partial<Warehouse>): Promise<Warehouse> => {
    return api.post('/warehouses', warehouse);
  },

  update: async (id: string, warehouse: Partial<Warehouse>): Promise<Warehouse> => {
    return api.put(`/warehouses/${id}`, warehouse);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/warehouses/${id}`);
  },

  // Location methods
  createLocation: async (location: Partial<Location>): Promise<Location> => {
    return api.post('/warehouses/locations', location);
  },

  getLocations: async (): Promise<Location[]> => {
    return api.get('/warehouses/locations');
  },

  deleteLocation: async (id: string): Promise<void> => {
    return api.delete(`/warehouses/locations/${id}`);
  }
};
