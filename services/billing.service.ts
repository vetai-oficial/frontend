import { httpClient } from '@/infra/http-client';
import type { Plan } from '@/types/billing';

export const billingService = {
  listPlans: () => httpClient<Plan[]>('billing/plans', { method: 'GET' }),
};
