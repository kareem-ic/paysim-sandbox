import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './client';

// Types
export interface Transaction {
  transaction_id: string;
  type: 'authorization' | 'capture' | 'refund';
  status: 'approved' | 'declined' | 'completed';
  amount: number;
  currency: string;
  created_at: string;
  merchant_id: string;
  auth_id?: string;
  description?: string;
}

export interface Metrics {
  total_payments: number;
  api_latency_p95: number;
  error_rate: number;
  tps: number;
}

export interface WebhookEvent {
  event_type: string;
  endpoint: string;
  status: 'delivered' | 'failed' | 'pending';
  timestamp: string;
}

// API functions
const fetchTransactions = async (): Promise<Transaction[]> => {
  const response = await api.get('/transactions');
  return response.data;
};

const fetchMetrics = async (): Promise<Metrics> => {
  const response = await api.get('/metrics');
  return response.data;
};

const fetchWebhookEvents = async (): Promise<WebhookEvent[]> => {
  const response = await api.get('/webhooks/events');
  return response.data;
};

// React Query hooks
export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
    staleTime: 30000, // 30 seconds
  });
};

export const useMetrics = () => {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
    staleTime: 10000, // 10 seconds
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
  });
};

export const useWebhookEvents = () => {
  return useQuery({
    queryKey: ['webhook-events'],
    queryFn: fetchWebhookEvents,
    staleTime: 15000, // 15 seconds
  });
};

// Mutations
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/payments/authorize', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });
};

export const useAddWebhookEndpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { url: string; events: string[] }) => {
      const response = await api.post('/webhooks/endpoints', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-events'] });
    },
  });
}; 