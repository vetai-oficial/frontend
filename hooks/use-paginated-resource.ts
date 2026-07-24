'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
  PaginatedMeta,
  PaginatedQueryParams,
  PaginatedResponse,
} from '@/types/common';

type PaginatedMode = 'replace' | 'append';

interface UsePaginatedResourceOptions<TItem, TFilters extends object> {
  fetcher: (
    params: PaginatedQueryParams<TFilters>,
  ) => Promise<PaginatedResponse<TItem>>;
  initialFilters?: TFilters;
  initialPage?: number;
  pageSize?: number;
  mode?: PaginatedMode;
  enabled?: boolean;
  debounceMs?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

interface FetchOptions {
  page?: number;
  append?: boolean;
  keepItems?: boolean;
}

export function usePaginatedResource<TItem, TFilters extends object = Record<string, never>>({
  fetcher,
  initialFilters,
  initialPage = 1,
  pageSize = 10,
  mode = 'replace',
  enabled = true,
  debounceMs = 0,
  sort,
  direction,
}: UsePaginatedResourceOptions<TItem, TFilters>) {
  const [items, setItems] = useState<TItem[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [filters, setFiltersState] = useState<TFilters>(
    () => (initialFilters ?? {}) as TFilters,
  );
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const requestIdRef = useRef(0);

  const search = useMemo(() => {
    const raw = (filters as { search?: unknown }).search;
    return typeof raw === 'string' ? raw : '';
  }, [filters]);

  const hasMorePage = meta ? !meta.last : false;
  const isEmpty = !loading && items.length === 0;

  const executeFetch = useCallback(
    async ({ page: nextPage = page, append, keepItems = false }: FetchOptions = {}) => {
      const requestId = ++requestIdRef.current;
      const shouldAppend = append ?? mode === 'append';

      if (shouldAppend && keepItems) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await fetcher({
          ...(filters as TFilters),
          page: nextPage,
          size: pageSize,
          ...(sort ? { sort } : {}),
          ...(direction ? { direction } : {}),
        });

        if (requestId !== requestIdRef.current) {
          return response;
        }

        setItems((prev) =>
          shouldAppend && keepItems ? [...prev, ...response.data] : response.data,
        );
        setMeta(response.meta);
        setPage(response.meta.page);
        return response;
      } catch (err) {
        if (requestId === requestIdRef.current) {
          setError(err);
        }
        throw err;
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [direction, fetcher, filters, mode, page, pageSize, sort],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void executeFetch({ page, append: false });
    }, debounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [debounceMs, enabled, executeFetch, page, filters]);

  const setFilters = useCallback(
    (value: TFilters | ((prev: TFilters) => TFilters)) => {
      setPage(initialPage);
      setFiltersState((prev) =>
        typeof value === 'function'
          ? (value as (prev: TFilters) => TFilters)(prev)
          : value,
      );
    },
    [initialPage],
  );

  const setSearch = useCallback(
    (value: string) => {
      setFilters((prev) => ({ ...prev, search: value } as TFilters));
    },
    [setFilters],
  );

  const refresh = useCallback(() => executeFetch({ page, append: false }), [executeFetch, page]);

  const fetch = useCallback(
    (nextPage?: number) => executeFetch({ page: nextPage ?? page, append: false }),
    [executeFetch, page],
  );

  const loadNextPage = useCallback(async () => {
    if (!hasMorePage || loadingMore || loading) return null;
    const nextPage = (meta?.page ?? page) + 1;
    return executeFetch({ page: nextPage, append: true, keepItems: true });
  }, [executeFetch, hasMorePage, loading, loadingMore, meta?.page, page]);

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    setItems([]);
    setMeta(null);
    setError(null);
    setPage(initialPage);
    setFiltersState((initialFilters ?? {}) as TFilters);
    setLoading(enabled);
    setLoadingMore(false);
  }, [enabled, initialFilters, initialPage]);

  const prependItem = useCallback((item: TItem) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const replaceItem = useCallback(
    (matcher: (item: TItem) => boolean, nextItem: TItem) => {
      setItems((prev) => prev.map((item) => (matcher(item) ? nextItem : item)));
    },
    [],
  );

  const removeItem = useCallback((matcher: (item: TItem) => boolean) => {
    setItems((prev) => prev.filter((item) => !matcher(item)));
  }, []);

  return {
    items,
    meta,
    filters,
    page,
    search,
    loading,
    loadingMore,
    error,
    hasMorePage,
    isEmpty,
    fetch,
    refresh,
    loadNextPage,
    setPage,
    setFilters,
    setSearch,
    reset,
    prependItem,
    replaceItem,
    removeItem,
  };
}
