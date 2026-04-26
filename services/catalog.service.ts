import { httpClient, buildQuery } from '@/infra/http-client';
import type { PaginatedResponse, QueryParams } from '@/types/common';
import type { CatalogItem, CatalogCategory, CreateCatalogItemPayload, UpdateCatalogItemPayload } from '@/types/catalog';

export const catalogService = {
  list: (params?: QueryParams & { category?: CatalogCategory; active?: boolean }) => {
    const base = buildQuery(params);
    const extra: string[] = [];
    if (params?.category) extra.push(`category=${params.category}`);
    if (params?.active !== undefined) extra.push(`active=${String(params.active)}`);
    const suffix = extra.length ? `${base ? '&' : '?'}${extra.join('&')}` : '';
    return httpClient<PaginatedResponse<CatalogItem>>(`catalog${base}${suffix}`);
  },

  get: (id: string) =>
    httpClient<CatalogItem>(`catalog/${id}`),

  create: (data: CreateCatalogItemPayload) =>
    httpClient<CatalogItem>('catalog', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateCatalogItemPayload) =>
    httpClient<CatalogItem>(`catalog/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    httpClient<void>(`catalog/${id}`, { method: 'DELETE' }),
};
