import { api } from './api';
import { Operation } from '../types';

interface CreateOperationPayload {
  type: 'Receipt' | 'Delivery';
  scheduleDate: string; // YYYY-MM-DD
  contact?: string;
  locationId: string; // For receipt (to) or delivery (from)
  items?: { productId: string; quantity: number }[];
}

interface UpdateOperationPayload {
  contact?: string;
  items?: { productId: string; quantity: number }[];
}

export const operationService = {
  list: async (params?: { type?: 'Receipt' | 'Delivery'; status?: string }): Promise<Operation[]> => {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type.toUpperCase());
    if (params?.status) query.append('status', params.status.toUpperCase());
    return api.get(`/operations?${query.toString()}`);
  },
  metrics: async (): Promise<{ receipts: { pending: number; received: number }; deliveries: { waiting: number; ready: number; delivered: number }; flow: { date: string; receipts: number; deliveries: number }[] }> => {
    return api.get('/operations/metrics');
  },
  create: async (payload: CreateOperationPayload): Promise<Operation> => {
    // Map type to backend enum
    const body = { ...payload, type: payload.type.toUpperCase() };
    return api.post('/operations', body);
  },
  updateDraft: async (id: string, payload: UpdateOperationPayload): Promise<Operation> => {
    return api.patch(`/operations/${id}`, payload);
  },
  updateStatus: async (id: string, status: string): Promise<Operation> => {
    return api.patch(`/operations/${id}/status`, { status: status.toUpperCase() });
  },
  refreshStatuses: async (): Promise<{ message: string }> => {
    return api.post('/operations/refresh-statuses', {});
  },
};
