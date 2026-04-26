export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface ChargeItem {
  name: string;
  quantity: number;
  unit_price: number;
  catalog_item_id?: string;
}

export interface Payment {
  id: string;
  notes?: string;
  amount: number;
  items: ChargeItem[];
  status: PaymentStatus;
  due_date: string;
  paid_at?: string;
  tutor_id: string;
  patient_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentPayload {
  notes?: string;
  items: ChargeItem[];
  status?: PaymentStatus;
  due_date: string;
  paid_at?: string;
  tutor_id: string;
  patient_id?: string;
}

export interface UpdatePaymentPayload {
  notes?: string;
  items?: ChargeItem[];
  status?: PaymentStatus;
  due_date?: string;
  paid_at?: string;
  patient_id?: string;
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  CANCELLED: 'Cancelado',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, { bg: string; text: string }> = {
  PENDING:   { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  PAID:      { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  CANCELLED: { bg: 'bg-red-100 dark:bg-red-900/30',    text: 'text-red-700 dark:text-red-300' },
};
