export interface Plan {
  id: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  userLimit: number;
  aiCredits: number;
  highlighted: boolean;
  billingMode: 'subscription' | 'invoice';
  paymentMethod: 'card' | 'bank_slip';
  features: Array<{
    key: string;
    label: string;
    description?: string;
  }>;
}
