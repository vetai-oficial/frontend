export interface PaginatedMeta {
  last: boolean;
  first: boolean;
  total_elements: number;
  total_pages: number;
  page: number;
  size: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface QueryParams {
  page?: number | undefined;
  size?: number | undefined;
  sort?: string | undefined;
  direction?: 'asc' | 'desc' | undefined;
  search?: string | undefined;
}
