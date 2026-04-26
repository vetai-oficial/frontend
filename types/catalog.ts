export type CatalogCategory = 'PRODUCT' | 'SERVICE' | 'EXAM' | 'VACCINE' | 'PROCEDURE' | 'OTHER';

export interface CatalogItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: CatalogCategory;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCatalogItemPayload {
  name: string;
  description?: string;
  price: number;
  category?: CatalogCategory;
  active?: boolean;
}

export interface UpdateCatalogItemPayload {
  name?: string;
  description?: string;
  price?: number;
  category?: CatalogCategory;
  active?: boolean;
}

export const CATALOG_CATEGORY_LABELS: Record<CatalogCategory, string> = {
  PRODUCT: 'Produto',
  SERVICE: 'Serviço',
  EXAM: 'Exame',
  VACCINE: 'Vacina',
  PROCEDURE: 'Procedimento',
  OTHER: 'Outro',
};

export const CATALOG_CATEGORY_COLORS: Record<CatalogCategory, { bg: string; text: string }> = {
  PRODUCT:   { bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-700 dark:text-blue-300' },
  SERVICE:   { bg: 'bg-teal-100 dark:bg-teal-900/30',   text: 'text-teal-700 dark:text-teal-300' },
  EXAM:      { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
  VACCINE:   { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  PROCEDURE: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  OTHER:     { bg: 'bg-slate-100 dark:bg-slate-700/50', text: 'text-slate-700 dark:text-slate-300' },
};
